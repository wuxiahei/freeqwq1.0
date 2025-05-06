import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { produce, setAutoFreeze } from 'immer'
import { uniqBy } from 'lodash-es'
import { useParams, usePathname } from 'next/navigation'
import { v4 as uuidV4 } from 'uuid'
import type {
  ChatConfig,
  ChatItem,
  ChatItemInTree,
  Inputs,
} from '../types'
import { getThreadMessages } from '../utils'
import type { InputForm } from './type'
import {
  getProcessedInputs,
  processOpeningStatement,
} from './utils'
import { TransferMethod } from '@/types/app'
import { useToastContext } from '@/app/components/base/toast'
import { ssePost } from '@/service/base'
import type { Annotation } from '@/models/log'
import { WorkflowRunningStatus } from '@/app/components/workflow/types'
import useTimestamp from '@/hooks/use-timestamp'
import { AudioPlayerManager } from '@/app/components/base/audio-btn/audio.player.manager'
import type { FileEntity } from '@/app/components/base/file-uploader/types'
import {
  getProcessedFiles,
  getProcessedFilesFromResponse,
} from '@/app/components/base/file-uploader/utils'

type GetAbortController = (abortController: AbortController) => void
type SendCallback = {
  onGetConversationMessages?: (conversationId: string, getAbortController: GetAbortController) => Promise<any>
  onGetSuggestedQuestions?: (responseItemId: string, getAbortController: GetAbortController) => Promise<any>
  onConversationComplete?: (conversationId: string) => void
  isPublicAPI?: boolean
}

export const useChat = (
  config?: ChatConfig,
  formSettings?: {
    inputs: Inputs
    inputsForm: InputForm[]
  },
  prevChatTree?: ChatItemInTree[],
  stopChat?: (taskId: string) => void,
) => {
  const { t } = useTranslation()
  const { formatTime } = useTimestamp()
  const { notify } = useToastContext()
  const conversationId = useRef('')
  const hasStopResponded = useRef(false)
  const [isResponding, setIsResponding] = useState(false)
  const isRespondingRef = useRef(false)
  const taskIdRef = useRef('')
  const [suggestedQuestions, setSuggestQuestions] = useState<string[]>([])
  const conversationMessagesAbortControllerRef = useRef<AbortController | null>(null)
  const suggestedQuestionsAbortControllerRef = useRef<AbortController | null>(null)
  const params = useParams()
  const pathname = usePathname()

  const [chatTree, setChatTree] = useState<ChatItemInTree[]>(prevChatTree || [])
  const chatTreeRef = useRef<ChatItemInTree[]>(chatTree)
  const [targetMessageId, setTargetMessageId] = useState<string>()
  const threadMessages = useMemo(() => getThreadMessages(chatTree, targetMessageId), [chatTree, targetMessageId])

  const getIntroduction = useCallback((str: string) => {
    return processOpeningStatement(str, formSettings?.inputs || {}, formSettings?.inputsForm || [])
  }, [formSettings?.inputs, formSettings?.inputsForm])

  /** Final chat list that will be rendered */
  const chatList = useMemo(() => {
    const ret = [...threadMessages]
    if (config?.opening_statement) {
      const index = threadMessages.findIndex(item => item.isOpeningStatement)

      if (index > -1) {
        ret[index] = {
          ...ret[index],
          content: getIntroduction(config.opening_statement),
          suggestedQuestions: config.suggested_questions,
        }
      }
      else {
        ret.unshift({
          id: `${Date.now()}`,
          content: getIntroduction(config.opening_statement),
          isAnswer: true,
          isOpeningStatement: true,
          suggestedQuestions: config.suggested_questions,
        })
      }
    }
    return ret
  }, [threadMessages, config?.opening_statement, getIntroduction, config?.suggested_questions])

  useEffect(() => {
    setAutoFreeze(false)
    return () => {
      setAutoFreeze(true)
    }
  }, [])

  /** Find the target node by bfs and then operate on it */
  const produceChatTreeNode = useCallback((targetId: string, operation: (node: ChatItemInTree) => void) => {
    return produce(chatTreeRef.current, (draft) => {
      const queue: ChatItemInTree[] = [...draft]
      while (queue.length > 0) {
        const current = queue.shift()!
        if (current.id === targetId) {
          operation(current)
          break
        }
        if (current.children)
          queue.push(...current.children)
      }
    })
  }, [])

  type UpdateChatTreeNode = {
    (id: string, fields: Partial<ChatItemInTree>): void
    (id: string, update: (node: ChatItemInTree) => void): void
  }

  const updateChatTreeNode: UpdateChatTreeNode = useCallback((
    id: string,
    fieldsOrUpdate: Partial<ChatItemInTree> | ((node: ChatItemInTree) => void),
  ) => {
    const nextState = produceChatTreeNode(id, (node) => {
      if (typeof fieldsOrUpdate === 'function') {
        fieldsOrUpdate(node)
      }
      else {
        Object.keys(fieldsOrUpdate).forEach((key) => {
          (node as any)[key] = (fieldsOrUpdate as any)[key]
        })
      }
    })
    setChatTree(nextState)
    chatTreeRef.current = nextState
  }, [produceChatTreeNode])

  const handleResponding = useCallback((isResponding: boolean) => {
    setIsResponding(isResponding)
    isRespondingRef.current = isResponding
  }, [])

  const handleStop = useCallback(() => {
    hasStopResponded.current = true
    handleResponding(false)
    if (stopChat && taskIdRef.current)
      stopChat(taskIdRef.current)
    if (conversationMessagesAbortControllerRef.current)
      conversationMessagesAbortControllerRef.current.abort()
    if (suggestedQuestionsAbortControllerRef.current)
      suggestedQuestionsAbortControllerRef.current.abort()
  }, [stopChat, handleResponding])

  const handleRestart = useCallback(() => {
    conversationId.current = ''
    taskIdRef.current = ''
    handleStop()
    setChatTree([])
    setSuggestQuestions([])
  }, [handleStop])

  const updateCurrentQAOnTree = useCallback(({
    parentId,
    responseItem,
    placeholderQuestionId,
    questionItem,
  }: {
    parentId?: string
    responseItem: ChatItem
    placeholderQuestionId: string
    questionItem: ChatItem
  }) => {
    let nextState: ChatItemInTree[]
    const currentQA = { ...questionItem, children: [{ ...responseItem, children: [] }] }
    if (!parentId && !chatTree.some(item => [placeholderQuestionId, questionItem.id].includes(item.id))) {
      // QA whose parent is not provided is considered as a first message of the conversation,
      // and it should be a root node of the chat tree
      nextState = produce(chatTree, (draft) => {
        draft.push(currentQA)
      })
    }
    else {
      // find the target QA in the tree and update it; if not found, insert it to its parent node
      nextState = produceChatTreeNode(parentId!, (parentNode) => {
        const questionNodeIndex = parentNode.children!.findIndex(item => [placeholderQuestionId, questionItem.id].includes(item.id))
        if (questionNodeIndex === -1)
          parentNode.children!.push(currentQA)
        else
          parentNode.children![questionNodeIndex] = currentQA
      })
    }
    setChatTree(nextState)
    chatTreeRef.current = nextState
  }, [chatTree, produceChatTreeNode])

  const handleSend = useCallback(async (
    url: string,
    data: {
      query: string
      files?: FileEntity[]
      parent_message_id?: string
      [key: string]: any
    },
    {
      onGetConversationMessages,
      onGetSuggestedQuestions,
      onConversationComplete,
      isPublicAPI,
    }: SendCallback,
  ) => {
    setSuggestQuestions([])

    if (isRespondingRef.current) {
      notify({ type: 'info', message: t('appDebug.errorMessage.waitForResponse') })
      return false
    }

    const parentMessage = threadMessages.find(item => item.id === data.parent_message_id)

    const placeholderQuestionId = `question-${Date.now()}`
    const questionItem = {
      id: placeholderQuestionId,
      content: data.query,
      isAnswer: false,
      message_files: data.files,
      parentMessageId: data.parent_message_id,
    }

    const placeholderAnswerId = `answer-placeholder-${Date.now()}`
    const placeholderAnswerItem = {
      id: placeholderAnswerId,
      content: '',
      isAnswer: true,
      parentMessageId: questionItem.id,
      siblingIndex: parentMessage?.children?.length ?? chatTree.length,
    }

    setTargetMessageId(parentMessage?.id)
    updateCurrentQAOnTree({
      parentId: data.parent_message_id,
      responseItem: placeholderAnswerItem,
      placeholderQuestionId,
      questionItem,
    })

    // answer
    const responseItem: ChatItemInTree = {
      id: placeholderAnswerId,
      content: '',
      agent_thoughts: [],
      message_files: [],
      isAnswer: true,
      parentMessageId: questionItem.id,
      siblingIndex: parentMessage?.children?.length ?? chatTree.length,
    }

    handleResponding(true)
    hasStopResponded.current = false

    const { query, files, inputs, ...restData } = data
    // debugger
    const bodyParams = {
      response_mode: 'streaming',
      conversation_id: conversationId.current,
      files: getProcessedFiles(files || []),
      query,
      inputs: getProcessedInputs(inputs || {}, formSettings?.inputsForm || []),
      ...restData,
    }
    if (bodyParams?.files?.length) {
      bodyParams.files = bodyParams.files.map((item) => {
        if (item.transfer_method === TransferMethod.local_file) {
          return {
            ...item,
            url: '',
          }
        }
        return item
      })
    }

    let isAgentMode = false
    let hasSetResponseId = false

    let ttsUrl = ''
    let ttsIsPublic = false
    if (params.token) {
      ttsUrl = '/text-to-audio'
      ttsIsPublic = true
    }
    else if (params.appId) {
      if (pathname.search('explore/installed') > -1)
        ttsUrl = `/installed-apps/${params.appId}/text-to-audio`
      else
        ttsUrl = `/apps/${params.appId}/text-to-audio`
    }
    const player = AudioPlayerManager.getInstance().getAudioPlayer(ttsUrl, ttsIsPublic, uuidV4(), 'none', 'none', (_: any): any => { })
    ssePost(
      url,
      {
        body: bodyParams,
      },
      {
        isPublicAPI,
        onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
          console.log('----taskid', taskId)
          if (!isAgentMode) {
            responseItem.content = responseItem.content + message
          }
          else {
            const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
            if (lastThought)
              lastThought.thought = lastThought.thought + message // need immer setAutoFreeze
          }

          if (messageId && !hasSetResponseId) {
            questionItem.id = `question-${messageId}`
            responseItem.id = messageId
            responseItem.parentMessageId = questionItem.id
            hasSetResponseId = true
          }

          if (isFirstMessage && newConversationId)
            conversationId.current = newConversationId

          taskIdRef.current = taskId
          if (messageId)
            responseItem.id = messageId

          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        async onCompleted(hasError?: boolean) {
          handleResponding(false)

          if (hasError)
            return

          if (onConversationComplete)
            onConversationComplete(conversationId.current)

          if (conversationId.current && !hasStopResponded.current && onGetConversationMessages) {
            const { data }: any = await onGetConversationMessages(
              conversationId.current,
              newAbortController => conversationMessagesAbortControllerRef.current = newAbortController,
            )
            const newResponseItem = data.find((item: any) => item.id === responseItem.id)
            if (!newResponseItem)
              return

            updateChatTreeNode(responseItem.id, {
              content: newResponseItem.answer,
              log: [
                ...newResponseItem.message,
                ...(newResponseItem.message[newResponseItem.message.length - 1].role !== 'assistant'
                  ? [
                    {
                      role: 'assistant',
                      text: newResponseItem.answer,
                      files: newResponseItem.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
                    },
                  ]
                  : []),
              ],
              more: {
                time: formatTime(newResponseItem.created_at, 'hh:mm A'),
                tokens: newResponseItem.answer_tokens + newResponseItem.message_tokens,
                latency: newResponseItem.provider_response_latency.toFixed(2),
              },
              // for agent log
              conversationId: conversationId.current,
              input: {
                inputs: newResponseItem.inputs,
                query: newResponseItem.query,
              },
            })
          }
          if (config?.suggested_questions_after_answer?.enabled && !hasStopResponded.current && onGetSuggestedQuestions) {
            try {
              const { data }: any = await onGetSuggestedQuestions(
                responseItem.id,
                newAbortController => suggestedQuestionsAbortControllerRef.current = newAbortController,
              )
              setSuggestQuestions(data)
            }
            catch (e) {
              setSuggestQuestions([])
            }
          }
        },
        onFile(file) {
          const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
          if (lastThought)
            responseItem.agent_thoughts![responseItem.agent_thoughts!.length - 1].message_files = [...(lastThought as any).message_files, file]

          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onThought(thought) {
          isAgentMode = true
          const response = responseItem as any
          if (thought.message_id && !hasSetResponseId)
            response.id = thought.message_id

          if (response.agent_thoughts.length === 0) {
            response.agent_thoughts.push(thought)
          }
          else {
            const lastThought = response.agent_thoughts[response.agent_thoughts.length - 1]
            // thought changed but still the same thought, so update.
            if (lastThought.id === thought.id) {
              thought.thought = lastThought.thought
              thought.message_files = lastThought.message_files
              responseItem.agent_thoughts![response.agent_thoughts.length - 1] = thought
            }
            else {
              responseItem.agent_thoughts!.push(thought)
            }
          }
          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onMessageEnd: (messageEnd) => {
          if (messageEnd.metadata?.annotation_reply) {
            responseItem.id = messageEnd.id
            responseItem.annotation = ({
              id: messageEnd.metadata.annotation_reply.id,
              authorName: messageEnd.metadata.annotation_reply.account.name,
            })
            updateCurrentQAOnTree({
              placeholderQuestionId,
              questionItem,
              responseItem,
              parentId: data.parent_message_id,
            })
            return
          }
          responseItem.citation = messageEnd.metadata?.retriever_resources || []
          const processedFilesFromResponse = getProcessedFilesFromResponse(messageEnd.files || [])
          responseItem.allFiles = uniqBy([...(responseItem.allFiles || []), ...(processedFilesFromResponse || [])], 'id')

          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onMessageReplace: (messageReplace) => {
          responseItem.content = messageReplace.answer
        },
        onError() {
          console.error('Chat stream error:', error);
          
          // 尝试重新连接，最多重试3次
          if (this.retryCount < 3) {
            this.retryCount++;
            console.log(`Attempting to reconnect (${this.retryCount}/3)...`);
            
            // 延迟1秒后重试
            setTimeout(() => {
              // 重新发起请求的逻辑
              // ...
            }, 1000);
          } else {
            // 达到最大重试次数，通知用户
            handleResponding(false)
            updateCurrentQAOnTree({
              placeholderQuestionId,
              questionItem,
              responseItem: {
                ...responseItem,
                content: responseItem.content + '\n\n[连接中断，请重试]'
              },
              parentId: data.parent_message_id,
            })
          }
        },
        onWorkflowStarted: ({ workflow_run_id, task_id }) => {
          taskIdRef.current = task_id
          responseItem.workflow_run_id = workflow_run_id
          responseItem.workflowProcess = {
            status: WorkflowRunningStatus.Running,
            tracing: [],
          }
          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onWorkflowFinished: ({ data: workflowFinishedData }) => {
          responseItem.workflowProcess!.status = workflowFinishedData.status as WorkflowRunningStatus
          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onIterationStart: ({ data: iterationStartedData }) => {
          responseItem.workflowProcess!.tracing!.push({
            ...iterationStartedData,
            status: WorkflowRunningStatus.Running,
          } as any)
          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onIterationFinish: ({ data: iterationFinishedData }) => {
          const tracing = responseItem.workflowProcess!.tracing!
          const iterationIndex = tracing.findIndex(item => item.node_id === iterationFinishedData.node_id
            && (item.execution_metadata?.parallel_id === iterationFinishedData.execution_metadata?.parallel_id || item.parallel_id === iterationFinishedData.execution_metadata?.parallel_id))!
          tracing[iterationIndex] = {
            ...tracing[iterationIndex],
            ...iterationFinishedData,
            status: WorkflowRunningStatus.Succeeded,
          } as any

          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onNodeStarted: ({ data: nodeStartedData }) => {
          if (nodeStartedData.iteration_id)
            return

          responseItem.workflowProcess!.tracing!.push({
            ...nodeStartedData,
            status: WorkflowRunningStatus.Running,
          } as any)
          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onNodeFinished: ({ data: nodeFinishedData }) => {
          if (nodeFinishedData.iteration_id)
            return

          const currentIndex = responseItem.workflowProcess!.tracing!.findIndex((item) => {
            if (!item.execution_metadata?.parallel_id)
              return item.node_id === nodeFinishedData.node_id

            return item.node_id === nodeFinishedData.node_id && (item.execution_metadata?.parallel_id === nodeFinishedData.execution_metadata.parallel_id)
          })
          responseItem.workflowProcess!.tracing[currentIndex] = nodeFinishedData as any

          updateCurrentQAOnTree({
            placeholderQuestionId,
            questionItem,
            responseItem,
            parentId: data.parent_message_id,
          })
        },
        onTTSChunk: (messageId: string, audio: string) => {
          if (!audio || audio === '')
            return
          player.playAudioWithAudio(audio, true)
          AudioPlayerManager.getInstance().resetMsgId(messageId)
        },
        onTTSEnd: (messageId: string, audio: string) => {
          player.playAudioWithAudio(audio, false)
        },
      })
    return true
  }, [
    t,
    chatTree.length,
    threadMessages,
    config?.suggested_questions_after_answer,
    updateCurrentQAOnTree,
    updateChatTreeNode,
    notify,
    handleResponding,
    formatTime,
    params.token,
    params.appId,
    pathname,
    formSettings,
  ])

  const handleAnnotationEdited = useCallback((query: string, answer: string, index: number) => {
    const targetQuestionId = chatList[index - 1].id
    const targetAnswerId = chatList[index].id

    updateChatTreeNode(targetQuestionId, {
      content: query,
    })
    updateChatTreeNode(targetAnswerId, {
      content: answer,
      annotation: {
        ...chatList[index].annotation,
        logAnnotation: undefined,
      } as any,
    })
  }, [chatList, updateChatTreeNode])

  const handleAnnotationAdded = useCallback((annotationId: string, authorName: string, query: string, answer: string, index: number) => {
    const targetQuestionId = chatList[index - 1].id
    const targetAnswerId = chatList[index].id

    updateChatTreeNode(targetQuestionId, {
      content: query,
    })

    updateChatTreeNode(targetAnswerId, {
      content: chatList[index].content,
      annotation: {
        id: annotationId,
        authorName,
        logAnnotation: {
          content: answer,
          account: {
            id: '',
            name: authorName,
            email: '',
          },
        },
      } as Annotation,
    })
  }, [chatList, updateChatTreeNode])

  const handleAnnotationRemoved = useCallback((index: number) => {
    const targetAnswerId = chatList[index].id

    updateChatTreeNode(targetAnswerId, {
      content: chatList[index].content,
      annotation: {
        ...(chatList[index].annotation || {}),
        id: '',
      } as Annotation,
    })
  }, [chatList, updateChatTreeNode])

  return {
    chatList,
    setTargetMessageId,
    conversationId: conversationId.current,
    isResponding,
    setIsResponding,
    handleSend,
    suggestedQuestions,
    handleRestart,
    handleStop,
    handleAnnotationEdited,
    handleAnnotationAdded,
    handleAnnotationRemoved,
  }
}

// 导入存储工具
import { saveChatState, loadChatState, clearChatState } from '@/app/utils/storage';

// 添加断点续传相关状态
const [lastReceivedChunkId, setLastReceivedChunkId] = useState<string | null>(null);
const [receivedChunks, setReceivedChunks] = useState<Map<string, string>>(new Map());
const maxRetryAttempts = 3;
const [retryCount, setRetryCount] = useState(0);

// 在组件初始化时加载保存的状态
useEffect(() => {
  if (conversationId.current) {
    const { chunks, lastChunkId } = loadChatState(conversationId.current);
    
    if (chunks.size > 0 && lastChunkId) {
      setReceivedChunks(chunks);
      setLastReceivedChunkId(lastChunkId);
      
      // 更新UI显示已接收的内容
      updateCurrentQAOnTree({
        placeholderQuestionId,
        questionItem,
        responseItem: {
          ...responseItem,
          content: Array.from(chunks.values()).join('')
        },
        parentId: data.parent_message_id,
      });
      
      // 尝试恢复流
      resumeChatStream({
        conversationId: conversationId.current,
        lastChunkId,
        onMessage,
        onError,
        onCompleted,
      }).catch(error => {
        console.error('Failed to resume chat on init:', error);
      });
    }
  }
}, [conversationId.current]);

// 修改 onMessage 处理函数
const onMessage = (message: string) => {
  try {
    // 解析消息，假设消息格式为 {id: string, seq: number, content: string, isLast: boolean}
    const parsedMessage = JSON.parse(message);
    const { id, seq, content, isLast } = parsedMessage;
    
    // 更新最后接收的块ID
    setLastReceivedChunkId(id);
    
    // 存储接收到的块
    const newChunks = new Map(receivedChunks);
    newChunks.set(`${id}-${seq}`, content);
    setReceivedChunks(newChunks);
    
    // 保存到本地存储
    saveChatState(conversationId.current, newChunks, id);
    
    // 更新UI显示
    updateCurrentQAOnTree({
      placeholderQuestionId,
      questionItem,
      responseItem: {
        ...responseItem,
        content: Array.from(newChunks.values()).join('')
      },
      parentId: data.parent_message_id,
    });
    
    // 如果是最后一块，标记完成
    if (isLast) {
      handleResponding(false);
      // 清理缓存
      clearChatState(conversationId.current);
      setReceivedChunks(new Map());
      setLastReceivedChunkId(null);
      setRetryCount(0);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

// 修改错误处理函数
const onError = async (error: any) => {
  console.error('Chat stream error:', error);
  
  // 如果有最后接收的块ID且未超过最大重试次数
  if (lastReceivedChunkId && retryCount < maxRetryAttempts) {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    console.log(`连接中断，尝试恢复 (${newRetryCount}/${maxRetryAttempts})...`);
    
    try {
      // 调用恢复API，从最后接收的块继续
      await resumeChatStream({
        conversationId: conversationId.current,
        lastChunkId: lastReceivedChunkId,
        onMessage,
        onError,
        onCompleted,
      });
    } catch (resumeError) {
      console.error('Failed to resume chat stream:', resumeError);
      
      // 如果恢复失败，通知用户
      if (newRetryCount >= maxRetryAttempts) {
        handleResponding(false);
        updateCurrentQAOnTree({
          placeholderQuestionId,
          questionItem,
          responseItem: {
            ...responseItem,
            content: Array.from(receivedChunks.values()).join('') + '\n\n[连接中断，请刷新页面重试]'
          },
          parentId: data.parent_message_id,
        });
      }
    }
  } else {
    // 超过最大重试次数或没有最后接收的块ID
    handleResponding(false);
    updateCurrentQAOnTree({
      placeholderQuestionId,
      questionItem,
      responseItem: {
        ...responseItem,
        content: Array.from(receivedChunks.values()).join('') + '\n\n[连接中断，请刷新页面重试]'
      },
      parentId: data.parent_message_id,
    });
  }
};

// 添加恢复聊天流的函数
const resumeChatStream = async ({
  conversationId,
  lastChunkId,
  onMessage,
  onError,
  onCompleted,
}: {
  conversationId: string;
  lastChunkId: string;
  onMessage: (message: string) => void;
  onError: (error: any) => void;
  onCompleted: () => void;
}) => {
  // 创建恢复请求
  const response = await fetch('/api/chat-resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      last_chunk_id: lastChunkId,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`恢复聊天失败: ${response.status}`);
  }
  
  // 处理流式响应
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法获取响应流');
  }
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onCompleted();
        break;
      }
      
      // 处理接收到的数据块
      const chunk = new TextDecoder().decode(value);
      const messages = chunk.split('\n').filter(Boolean);
      
      for (const message of messages) {
        onMessage(message);
      }
    }
  } catch (error) {
    onError(error);
  } finally {
    reader.releaseLock();
  }
};
