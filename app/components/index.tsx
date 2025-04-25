/* eslint-disable @typescript-eslint/no-use-before-define */
'use client'
import type { FC } from 'react'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import produce, { setAutoFreeze } from 'immer'
import { useBoolean, useGetState } from 'ahooks'
import useConversation from '@/hooks/use-conversation'
import Toast from '@/app/components/base/toast'
import Sidebar from '@/app/components/sidebar'
import ConfigSence from '@/app/components/config-scence'
import Header from '@/app/components/header'
import { fetchAppParams, fetchChatList, fetchConversations, generationConversationName, sendChatMessage, updateFeedback, deleteConversation, stopChatMessageResponding } from '@/service'
import type { ChatItem, ConversationItem, Feedbacktype, PromptConfig, VisionFile, VisionSettings } from '@/types/app'
import { Resolution, TransferMethod, WorkflowRunningStatus } from '@/types/app'
import Chat from '@/app/components/chat'
import { setLocaleOnClient } from '@/i18n/client'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import Loading from '@/app/components/base/loading'
import { replaceVarWithValues, userInputsFormToPromptVariables } from '@/utils/prompt'
import AppUnavailable from '@/app/components/app-unavailable'
import { getAppId, getApiKey, AI_PLUS_CONFIGS, APP_INFO, isShowPrompt, promptTemplate } from '@/config'
import type { Annotation as AnnotationType } from '@/types/log'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'
import Tooltip from '@/app/components/base/tooltip'
import { useRouter } from 'next/navigation'

export type IMainProps = {
  params?: any
  component?: FC
}

// 添加一个常量用于存储删除的会话 ID
const DELETED_CONVERSATIONS_KEY = 'deleted_conversations'

// 获取已删除的会话 ID 列表
const getDeletedConversations = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DELETED_CONVERSATIONS_KEY) || '[]')
  } catch {
    return []
  }
}

// 添加 usePushStateListener hook
const usePushStateListener = (callback: (url: string) => void) => {
  useEffect(() => {
    const originalPushState = history.pushState;
    history.pushState = function (data, title, url) {
      originalPushState.apply(history, [data, title, url]);
      if (typeof url === 'string') {
        callback(url);
      }
    };
    return () => {
      history.pushState = originalPushState;
    };
  }, [callback]);
};

const Main: FC<IMainProps> = ({
  params,
  component: Component,
}) => {
  const { t } = useTranslation()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  // const currentApp = AI_PLUS_CONFIGS[params?.appId] || AI_PLUS_CONFIGS['43192a18-2b15-451e-9aec-37d55d5673db']
  // const APP_ID = currentApp?.appId
  // const API_KEY = currentApp?.apiKey
  const APP_ID = getAppId()
  const API_KEY = getApiKey()
  const hasSetAppConfig = APP_ID && API_KEY
  console.log(APP_ID, API_KEY);
  const router = useRouter()

  const [isNewChat, setIsNewChat] = useState(false)
  useEffect(() => {
    if (params?.conversationId) {
      // setCurrConversationId(params.conversationId, APP_ID)
      handleConversationIdChange(params.conversationId)
    }
    if (params?.isNewChat !== undefined) {
      setIsNewChat(params.isNewChat)
      console.log("isNewChat", params.isNewChat)
    }
  }, [params?.conversationId, params?.isNewChat])

  /*
  * app info
  */
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
  const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [inited, setInited] = useState<boolean>(false)
  // in mobile, show sidebar by click button
  const [isShowSidebar, { setTrue: showSidebar, setFalse: hideSidebar }] = useBoolean(true)
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })

  useEffect(() => {
    if (APP_INFO?.title)
      document.title = `${APP_INFO.title}`
  }, [APP_INFO?.title])

  // onData change thought (the produce obj). https://github.com/immerjs/immer/issues/576
  useEffect(() => {
    setAutoFreeze(false)
    return () => {
      setAutoFreeze(true)
    }
  }, [])

  /*
  * conversation info
  */
  const {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currConversationInfo,
    currInputs,
    newConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    setNewConversationInfo,
    setExistConversationInfo,
  } = useConversation()

  const [conversationIdChangeBecauseOfNew, setConversationIdChangeBecauseOfNew, getConversationIdChangeBecauseOfNew] = useGetState(false)
  const [isChatStarted, { setTrue: setChatStarted, setFalse: setChatNotStarted }] = useBoolean(false)
  const handleStartChat = (inputs: Record<string, any>) => {
    createNewChat()
    setConversationIdChangeBecauseOfNew(true)
    setCurrInputs(inputs)
    setChatStarted()

    // 发送模型选择信息
    if (inputs.model_name) {
      setChatList(generateNewChatListWithOpenStatement(`model_name=${inputs.model_name}`, inputs))
    } else {
      setChatList(generateNewChatListWithOpenStatement('', inputs))
    }
  }
  const hasSetInputs = (() => {
    if (!isNewConversation)
      return true

    return isChatStarted
  })()

  const conversationName = currConversationInfo?.name || t('app.chat.newChatDefaultName') as string
  const conversationIntroduction = currConversationInfo?.introduction || ''

  const handleConversationSwitch = () => {
    if (!inited)
      return

    // update inputs of current conversation
    let notSyncToStateIntroduction = ''
    let notSyncToStateInputs: Record<string, any> | undefined | null = {}
    if (!isNewConversation) {
      const item = conversationList.find(item => item.id === currConversationId)
      notSyncToStateInputs = item?.inputs || {}
      setCurrInputs(notSyncToStateInputs as any)
      notSyncToStateIntroduction = item?.introduction || ''
      setExistConversationInfo({
        name: item?.name || '',
        introduction: notSyncToStateIntroduction,
      })
    }
    else {
      notSyncToStateInputs = newConversationInputs
      setCurrInputs(notSyncToStateInputs)
    }

    // update chat list of current conversation
    if (!isNewConversation && !conversationIdChangeBecauseOfNew && !isResponding) {
      fetchChatList(currConversationId).then((res: any) => {
        const { data } = res
        const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(notSyncToStateIntroduction, notSyncToStateInputs)

        data.forEach((item: any) => {
          // 过滤掉模型选择消息和联网搜索消息
          if (item.query.startsWith('model_name=') ||
            item.query.startsWith('online_search=') ||
            item.query === 'status:selected model')
            return

          newChatList.push({
            id: `question-${item.id}`,
            content: item.query,
            isAnswer: false,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'user') || [],

          })
          newChatList.push({
            id: item.id,
            content: item.answer,
            agent_thoughts: addFileInfos(item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts, item.message_files),
            feedback: item.feedback,
            isAnswer: true,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
          })
        })
        setChatList(newChatList)
      })
    }

    if (isNewConversation && isChatStarted)
      setChatList(generateNewChatListWithOpenStatement())
  }
  useEffect(handleConversationSwitch, [currConversationId, inited])

  const handleConversationIdChange = (id: string) => {
    console.log(id)
    if (id === '-1') {
      createNewChat()
      setConversationIdChangeBecauseOfNew(true)
      setChatStarted()
    }
    else {
      setConversationIdChangeBecauseOfNew(false)
    }
    // trigger handleConversationSwitch
    setCurrConversationId(id, APP_ID)
    // 只在移动端时隐藏侧边栏
    if (isMobile) {
      hideSidebar()
    }
  }

  /*
  * chat info. chat is under conversation.
  */
  const [chatList, setChatList, getChatList] = useGetState<ChatItem[]>([])
  const chatListDomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // scroll to bottom
    if (chatListDomRef.current)
      chatListDomRef.current.scrollTop = chatListDomRef.current.scrollHeight
  }, [chatList, currConversationId])
  // user can not edit inputs if user had send message
  const canEditInputs = !chatList.some(item => item.isAnswer === false) && isNewConversation
  const createNewChat = () => {
    // if new chat is already exist, do not create new chat
    if (conversationList.some(item => item.id === '-1'))
      return

    setConversationList(produce(conversationList, (draft) => {
      draft.unshift({
        id: '-1',
        name: t('app.chat.newChatDefaultName'),
        inputs: newConversationInputs,
        introduction: conversationIntroduction,
      })
    }))
  }

  // sometime introduction is not applied to state
  const generateNewChatListWithOpenStatement = (introduction?: string, inputs?: Record<string, any> | null) => {
    let calculatedIntroduction = introduction || conversationIntroduction || ''
    const calculatedPromptVariables = inputs || currInputs || null
    if (calculatedIntroduction && calculatedPromptVariables)
      calculatedIntroduction = replaceVarWithValues(calculatedIntroduction, promptConfig?.prompt_variables || [], calculatedPromptVariables)

    const openStatement = {
      id: `${Date.now()}`,
      content: calculatedIntroduction,
      isAnswer: true,
      feedbackDisabled: true,
      isOpeningStatement: isShowPrompt,
    }
    if (calculatedIntroduction)
      return [openStatement]

    return []
  }

  // init
  useEffect(() => {
    if (!hasSetAppConfig) {
      setAppUnavailable(true)
      return
    }
    (async () => {
      try {
        const [conversationData, appParams] = await Promise.all([fetchConversations(), fetchAppParams()])

        // 获取已删除的会话 ID
        const deletedIds = getDeletedConversations()

        // 过滤掉已删除的会话
        const { data: conversations, error } = conversationData as { data: ConversationItem[]; error: string }
        const filteredConversations = conversations.filter(conv => !deletedIds.includes(conv.id))

        // handle current conversation id
        const _conversationId = getConversationIdFromStorage(APP_ID)
        const isNotNewConversation = filteredConversations.some(item => item.id === _conversationId)

        // fetch new conversation info
        const { user_input_form, opening_statement: introduction, file_upload, system_parameters }: any = appParams
        setLocaleOnClient(APP_INFO.default_language, true)
        setNewConversationInfo({
          name: t('app.chat.newChatDefaultName'),
          introduction,
        })
        const prompt_variables = userInputsFormToPromptVariables(user_input_form)
        setPromptConfig({
          prompt_template: promptTemplate,
          prompt_variables,
        } as PromptConfig)
        setVisionConfig({
          enabled: file_upload?.allowed_file_types.includes('image') && !!file_upload?.enabled,
          number_limits: 2,
          detail: Resolution.low,
          transfer_methods: [TransferMethod.local_file],
          image_file_size_limit: system_parameters?.system_parameters || 0,
        })
        setConversationList(filteredConversations)

        // 修改这里的逻辑，优先考虑 params 中的 isNewChat
        if (params?.isNewChat) {
          // 如果是新对话，强制设置为 '-1'
          setCurrConversationId('-1', APP_ID, false)
        } else if (isNotNewConversation) {
          // 只有在不是新对话时，才使用存储的会话 ID
          setCurrConversationId(_conversationId, APP_ID, false)
        }

        setInited(true)
      }
      catch (e: any) {
        if (e.status === 404) {
          setAppUnavailable(true)
        }
        else {
          setIsUnknownReason(true)
          setAppUnavailable(true)
          console.log(e);
        }
      }
    })()
  }, [])

  const [isResponding, { setTrue: setRespondingTrue, setFalse: setRespondingFalse }] = useBoolean(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const { notify } = Toast
  const logError = (message: string) => {
    notify({ type: 'error', message })
  }

  const checkCanSend = () => {
    if (currConversationId !== '-1')
      return true

    if (!currInputs || !promptConfig?.prompt_variables)
      return true

    const inputLens = Object.values(currInputs).length
    const promptVariablesLens = promptConfig.prompt_variables.length

    const emptyInput = inputLens < promptVariablesLens || Object.values(currInputs).find(v => !v)
    if (emptyInput) {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  const [controlFocus, setControlFocus] = useState(0)
  const [openingSuggestedQuestions, setOpeningSuggestedQuestions] = useState<string[]>([])
  const [messageTaskId, setMessageTaskId] = useState('')
  const [hasStopResponded, setHasStopResponded, getHasStopResponded] = useGetState(false)
  const [isRespondingConIsCurrCon, setIsRespondingConCurrCon, getIsRespondingConIsCurrCon] = useGetState(true)
  const [userQuery, setUserQuery] = useState('')

  // 添加停止响应的处理函数
  const handleStopResponding = async () => {
    if (!messageTaskId) return

    try {
      await stopChatMessageResponding(messageTaskId)
      setHasStopResponded(true)
      // 中断当前的响应
      if (abortController) {
        abortController.abort()
        setAbortController(null)
      }
      setRespondingFalse()

      // 更新聊天列表，移除占位回答
      setChatList(produce(getChatList(), (draft) => {
        const placeholderIndex = draft.findIndex(item => item.id.includes('answer-placeholder'))
        if (placeholderIndex !== -1)
          draft.splice(placeholderIndex, 1)
      }))
    } catch (err) {
      notify({ type: 'error', message: 'failed to stop responding' })
    }
  }

  const updateCurrentQA = ({
    responseItem,
    questionId,
    placeholderAnswerId,
    questionItem,
  }: {
    responseItem: ChatItem
    questionId: string
    placeholderAnswerId: string
    questionItem: ChatItem
  }) => {
    // closesure new list is outdated.
    const newListWithAnswer = produce(
      getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
      (draft) => {
        if (!draft.find(item => item.id === questionId))
          draft.push({ ...questionItem })

        draft.push({ ...responseItem })
      })
    setChatList(newListWithAnswer)
  }

  const handleSend = async (message: string, files?: VisionFile[]) => {
    if (isResponding) {
      notify({ type: 'info', message: t('app.errorMessage.waitForResponse') })
      return
    }

    // 如果是模型选择消息，直接发送但不显示在聊天界面
    if (message.startsWith('model_name=') || message.startsWith('online_search=')) {
      const data: Record<string, any> = {
        inputs: currInputs,
        query: message,
        conversation_id: isNewConversation ? null : currConversationId,
      }

      setRespondingTrue()
      try {
        await sendChatMessage(data, {
          getAbortController: (abortController) => {
            setAbortController(abortController)
          },
          onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId }) => {
            if (isNewConversation && newConversationId) {
              setCurrConversationId(newConversationId, APP_ID, true)
              setConversationIdChangeBecauseOfNew(true)
            }
          },
          onCompleted: () => {
            setRespondingFalse()
            setConversationIdChangeBecauseOfNew(true)
          },
          onError: (error) => {
            setRespondingFalse()
          },
          onFile: () => { },
          onThought: () => { },
          onMessageEnd: () => { },
          onMessageReplace: () => { },
          onWorkflowStarted: () => { },
          onNodeStarted: () => { },
          onNodeFinished: () => { },
          onWorkflowFinished: () => { },
        })
      } catch (error) {
        setRespondingFalse()
      }
      return
    }

    const data: Record<string, any> = {
      inputs: currInputs,
      query: message,
      conversation_id: isNewConversation ? null : currConversationId,
    }

    if (visionConfig?.enabled && files && files?.length > 0) {
      data.files = files.map((item) => {
        if (item.transfer_method === TransferMethod.local_file) {
          return {
            ...item,
            url: '',
          }
        }
        return item
      })
    }

    // question
    const questionId = `question-${Date.now()}`
    const questionItem = {
      id: questionId,
      content: message,
      isAnswer: false,
      message_files: files,
    }

    const placeholderAnswerId = `answer-placeholder-${Date.now()}`
    const placeholderAnswerItem = {
      id: placeholderAnswerId,
      content: '',
      isAnswer: true,
    }

    const newList = [...getChatList(), questionItem, placeholderAnswerItem]
    setChatList(newList)

    let isAgentMode = false

    // answer
    const responseItem: ChatItem = {
      id: `${Date.now()}`,
      content: '',
      agent_thoughts: [],
      message_files: [],
      isAnswer: true,
    }
    let hasSetResponseId = false

    const prevTempNewConversationId = getCurrConversationId() || '-1'
    let tempNewConversationId = ''

    setRespondingTrue()
    try {
      sendChatMessage(data, {
        getAbortController: (abortController) => {
          setAbortController(abortController)
        },
        onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
          if (!isAgentMode) {
            responseItem.content = responseItem.content + message
          }
          else {
            const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
            if (lastThought)
              lastThought.thought = lastThought.thought + message
          }
          if (messageId && !hasSetResponseId) {
            responseItem.id = messageId
            hasSetResponseId = true
          }

          if (isFirstMessage && newConversationId) {
            tempNewConversationId = newConversationId
            history.pushState(null, '', `/chat/${tempNewConversationId}`)
          }

          setMessageTaskId(taskId)
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false)
            return
          }
          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        onCompleted: async (hasError?: boolean) => {
          if (hasError)
            return

          if (getConversationIdChangeBecauseOfNew()) {
            const { data: allConversations }: any = await fetchConversations()
            const newConversationId = allConversations[0].id
            await updateConversationName(newConversationId)

          }
          setConversationIdChangeBecauseOfNew(false)
          resetNewConversationInputs()
          setChatNotStarted()
          setCurrConversationId(tempNewConversationId, APP_ID, true)
          setRespondingFalse()
        },
        onError: (error) => {
          setRespondingFalse()
        },
        onFile: (file) => {
          const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
          if (lastThought)
            lastThought.message_files = [...(lastThought as any).message_files, { ...file }]

          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        onThought: (thought) => {
          isAgentMode = true
          const response = responseItem as any
          if (thought.message_id && !hasSetResponseId) {
            response.id = thought.message_id
            hasSetResponseId = true
          }
          if (response.agent_thoughts.length === 0) {
            response.agent_thoughts.push(thought)
          }
          else {
            const lastThought = response.agent_thoughts[response.agent_thoughts.length - 1]
            if (lastThought.id === thought.id) {
              thought.thought = lastThought.thought
              thought.message_files = lastThought.message_files
              responseItem.agent_thoughts![response.agent_thoughts.length - 1] = thought
            }
            else {
              responseItem.agent_thoughts!.push(thought)
            }
          }
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false)
            return false
          }

          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        onMessageEnd: (messageEnd) => {
          if (messageEnd.metadata?.annotation_reply) {
            responseItem.id = messageEnd.id
            responseItem.annotation = ({
              id: messageEnd.metadata.annotation_reply.id,
              authorName: messageEnd.metadata.annotation_reply.account.name,
            } as AnnotationType)
            const newListWithAnswer = produce(
              getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
              (draft) => {
                if (!draft.find(item => item.id === questionId))
                  draft.push({ ...questionItem })

                draft.push({
                  ...responseItem,
                })
              })
            setChatList(newListWithAnswer)
            return
          }
          const newListWithAnswer = produce(
            getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
            (draft) => {
              if (!draft.find(item => item.id === questionId))
                draft.push({ ...questionItem })

              draft.push({ ...responseItem })
            })
          setChatList(newListWithAnswer)
        },
        onMessageReplace: (messageReplace) => {
          setChatList(produce(
            getChatList(),
            (draft) => {
              const current = draft.find(item => item.id === messageReplace.id)

              if (current)
                current.content = messageReplace.answer
            },
          ))
        },
        onWorkflowStarted: ({ workflow_run_id, task_id }) => {
          responseItem.workflow_run_id = workflow_run_id
          responseItem.workflowProcess = {
            status: WorkflowRunningStatus.Running,
            tracing: [],
          }
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
        onWorkflowFinished: ({ data }) => {
          responseItem.workflowProcess!.status = data.status as WorkflowRunningStatus
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
        onNodeStarted: ({ data }) => {
          responseItem.workflowProcess!.tracing!.push(data as any)
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
        onNodeFinished: ({ data }) => {
          const currentIndex = responseItem.workflowProcess!.tracing!.findIndex(item => item.node_id === data.node_id)
          responseItem.workflowProcess!.tracing[currentIndex] = data as any
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
      })
    } catch (error) {
      console.error('Failed to send chat message:', error)
      setRespondingFalse()
    }
  }

  const handleFeedback = async (messageId: string, feedback: Feedbacktype) => {
    await updateFeedback({ url: `/messages/${messageId}/feedbacks`, body: { rating: feedback.rating } })
    const newChatList = chatList.map((item) => {
      if (item.id === messageId) {
        return {
          ...item,
          feedback,
        }
      }
      return item
    })
    setChatList(newChatList)
    notify({ type: 'success', message: t('common.api.success') })
  }

  const renderSidebar = () => {
    if (!APP_ID || !APP_INFO || !promptConfig)
      return null
    return (
      <Sidebar
        list={conversationList}
        onCurrentIdChange={handleConversationIdChange}
        currentId={currConversationId}
        copyRight={APP_INFO.copyright || APP_INFO.title}
        onPinConversation={handlePinConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onHandleConversationIdChange={handleConversationIdChange}
        onHideSideBar={hideSidebar}
      />
    )
  }

  // 添加状态保存最后选择的模型
  const [lastSelectedModel, setLastSelectedModel] = useState<string>('deepseek-v3')
  const [isOnlineSearch, setIsOnlineSearch] = useState(false)

  useEffect(() => {
    if (!isNewConversation && currConversationId) {
      console.log("fetchChatList", currConversationId)
      fetchChatList(currConversationId).then((res: any) => {
        const { data } = res
        // 找到最后一条模型选择消息
        const lastModelMessage = [...data].reverse().find((item: any) =>
          item.query.startsWith('model_name=')
        )
        if (lastModelMessage) {
          const modelName = lastModelMessage.query.replace('model_name=', '')
          setLastSelectedModel(modelName)
        }
        else {
          setLastSelectedModel('deepseek-v3')
        }

        // 找到最后一条联网搜索消息
        const lastSearchMessage = [...data].reverse().find((item: any) =>
          item.query.startsWith('online_search=')
        )
        if (lastSearchMessage) {
          const isOnline = lastSearchMessage.query.replace('online_search=', '') === 'true'
          setIsOnlineSearch(isOnline)
        }
        else {
          setIsOnlineSearch(false)
        }
      })
    }
    else {
      setLastSelectedModel('deepseek-v3')
      setIsOnlineSearch(false)
    }
  }, [currConversationId, isNewConversation])

  // 添加更新会话标题的函数
  const updateConversationName = async (conversationId: string) => {
    try {
      const { data: messages }: any = await fetchChatList(conversationId)

      // 找到第一条正常的用户消息，排除模型选择和在线搜索消息
      const firstUserMessage = messages
        .find((msg: any) => !msg.query.startsWith('model_name=') && !msg.query.startsWith('online_search='))

      if (firstUserMessage) {
        const title = firstUserMessage.query.slice(0, 12) + (firstUserMessage.query.length >= 12 ? '...' : '')

        // 直接使用 generationConversationName
        await generationConversationName(conversationId, title)

        // 更新本地状态
        const { data: allConversations }: any = await fetchConversations()

        // 获取已删除的会话 ID
        const deletedIds = getDeletedConversations()

        // 过滤掉已删除的会话
        const filteredConversations = allConversations.filter((conv: any) => !deletedIds.includes(conv.id))

        setConversationList(filteredConversations)
      }
    } catch (err) {
      console.error('Failed to update conversation name:', err)
    }
  }

  const handlePinConversation = async (id: string) => {
    try {
      // 在前端实现置顶逻辑
      const newConversationList = produce(conversationList, (draft) => {
        const index = draft.findIndex(item => item.id === id)
        if (index > 0) {
          const [item] = draft.splice(index, 1)
          draft.unshift(item)
        }
      })
      setConversationList(newConversationList)
      notify({ type: 'success', message: '置顶成功' })
    } catch (err) {
      notify({ type: 'error', message: '置顶失败' })
    }
  }

  const handleRenameConversation = async (id: string, name: string) => {
    try {
      await generationConversationName(id, name)
      const { data: allConversations }: any = await fetchConversations()
      setConversationList(allConversations)
      notify({ type: 'success', message: '重命名成功' })
    } catch (err) {
      notify({ type: 'error', message: '重命名失败' })
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      // 如果删除的是当前会话，先重置状态
      if (id === currConversationId) {
        handleConversationIdChange('-1')
        setChatNotStarted()
        resetNewConversationInputs()
      }

      // 更新前端的会话列表
      const newConversationList = conversationList.filter(item => item.id !== id)
      setConversationList(newConversationList)

      // 保存删除的会话 ID 到 localStorage
      const deletedIds = getDeletedConversations()
      deletedIds.push(id)
      localStorage.setItem(DELETED_CONVERSATIONS_KEY, JSON.stringify(deletedIds))

      // 如果还有其他会话，切换到第一个会话
      if (newConversationList.length > 0 && id === currConversationId)
        handleConversationIdChange(newConversationList[0].id)

      notify({ type: 'success', message: '删除成功' })
    } catch (err) {
      notify({ type: 'error', message: '删除失败' })
    }
  }

  // 添加 URL 更新处理函数
  const handleUrlChange = useCallback((url: string) => {
    console.log('URL changed to:', url);
  }, []);

  // 使用 usePushStateListener
  usePushStateListener(handleUrlChange);

  if (appUnavailable)
    return <AppUnavailable isUnknownReason={isUnknownReason} errMessage={!hasSetAppConfig ? 'Please set APP_ID and API_KEY in config/index.tsx' : ''} />

  if (!APP_ID || !APP_INFO || !promptConfig)
    return <Loading type='app' />

  return (
    <div className='fixed inset-0 bg-gray-100'>
      <div className="absolute inset-0 flex">
        {/* sidebar */}
        {!isMobile && (
          <div className={`fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ${isShowSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
            {renderSidebar()}
          </div>
        )}
        {/* main */}
        <div className={`relative flex-1 flex flex-col min-w-0 pt-[7px] transition-all duration-300 ${!isMobile && isShowSidebar ? 'ml-[240px]' : 'ml-0'}`}>
          <div className={`relative flex-1 flex flex-col min-w-0 bg-white mb-[7px] mr-[7px] rounded-lg ${isShowSidebar ? '' : 'ml-[7px]'}`}>
            {/* {!hasSetInputs && (
              <ConfigSence
                conversationName={conversationName}
                hasSetInputs={hasSetInputs}
                isPublicVersion={isShowPrompt}
                siteInfo={APP_INFO}
                promptConfig={promptConfig}
                onStartChat={handleStartChat}
                canEditInputs={canEditInputs}
                savedInputs={currInputs as Record<string, any>}
                onInputsChange={setCurrInputs}
              ></ConfigSence>
            )} */}
            {!isShowSidebar && !isMobile && (
              <Tooltip selector='sidebar-open'
                position='right'
                htmlContent={
                  <div>
                    <div>{t('common.operation.openSidebar')}</div>
                  </div>
                }
              >
                <button className="absolute left-2 top-2 p-1 w-8 h-8 hover:bg-gray-200 rounded-lg flex items-center justify-center z-50"
                  onClick={showSidebar}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="20" height="20" viewBox="0 0 1024 1024" className="iconify text-gray-500"><path d="M861.866667 162.133333c-17.066667-17.066667-42.666667-29.866667-68.266667-29.866666H226.133333c-25.6 0-51.2 8.533333-68.266666 29.866666S128 204.8 128 230.4v567.466667c0 25.6 8.533333 51.2 29.866667 68.266666 17.066667 17.066667 42.666667 29.866667 68.266666 29.866667h567.466667c25.6 0 51.2-8.533333 68.266667-29.866667 17.066667-17.066667 29.866667-42.666667 29.866666-68.266666V226.133333c0-25.6-8.533333-46.933333-29.866666-64zM366.933333 814.933333H226.133333c-4.266667 0-8.533333 0-12.8-4.266666-4.266667-4.266667-4.266666-8.533333-4.266666-12.8V226.133333c0-4.266667 0-8.533333 4.266666-12.8 4.266667-4.266667 8.533333-4.266667 12.8-4.266666h140.8v605.866666z m448-17.066666c0 4.266667 0 8.533333-4.266666 12.8-4.266667 4.266667-8.533333 4.266667-12.8 4.266666h-354.133334V209.066667h354.133334c4.266667 0 8.533333 0 12.8 4.266666 4.266667 4.266667 4.266667 8.533333 4.266666 12.8v571.733334z" fill="currentColor" /></svg>
                </button>
              </Tooltip>
            )}
            {
              hasSetInputs && (
                <div className='relative grow h-[200px] w-full max-w-full mx-auto overflow-hidden'>
                  {Component ? <Component /> : (
                    <Chat
                      chatList={chatList}
                      onSend={handleSend}
                      onFeedback={handleFeedback}
                      isResponding={isResponding}
                      checkCanSend={checkCanSend}
                      visionConfig={visionConfig}
                      currConversationId={currConversationId}
                      isOnlineSearch={isOnlineSearch}
                      lastSelectedModel={lastSelectedModel}
                      onStopResponding={handleStopResponding}
                      isNewChat={isNewChat}
                    />
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Main)
