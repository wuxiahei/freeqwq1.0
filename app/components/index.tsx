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
import { fetchAppParams, fetchChatList, fetchConversations, generationConversationName, sendChatMessage, updateFeedback } from '@/service'
import type { ChatItem, ConversationItem, Feedbacktype, PromptConfig, VisionFile, VisionSettings } from '@/types/app'
import { Resolution, TransferMethod, WorkflowRunningStatus } from '@/types/app'
import Chat from '@/app/components/chat'
import { setLocaleOnClient } from '@/i18n/client'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import Loading from '@/app/components/base/loading'
import { replaceVarWithValues, userInputsFormToPromptVariables } from '@/utils/prompt'
import AppUnavailable from '@/app/components/app-unavailable'
import { API_KEY, APP_ID, APP_INFO, isShowPrompt, promptTemplate } from '@/config'
import type { Annotation as AnnotationType } from '@/types/log'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'

export type IMainProps = {
  params: any
}

const Main: FC<IMainProps> = () => {
  const { t } = useTranslation()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const hasSetAppConfig = APP_ID && API_KEY

  /*
  * app info
  */
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
  const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [inited, setInited] = useState<boolean>(false)
  // in mobile, show sidebar by click button
  const [isShowSidebar, { setTrue: showSidebar, setFalse: hideSidebar }] = useBoolean(false)
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })

  useEffect(() => {
    if (APP_INFO?.title)
      document.title = `${APP_INFO.title} - Powered by Dify`
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

  // 生成新对话名称的持久化方法
  const generatePersistentNewConversationName = useCallback(() => {
    const now = new Date();
    const dateString = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const timeString = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const storageKey = `newConversationName_${APP_ID}`;
    const storedName = localStorage.getItem(storageKey);

    const newName = storedName || `新对话 ${dateString} ${timeString}`;

    // 确保每次生成都存储新名称
    localStorage.setItem(storageKey, newName);

    return newName;
  }, [APP_ID]);

  const handleStartChat = (inputs: Record<string, any>) => {
    const newName = generatePersistentNewConversationName();
    createNewChat(newName)
    setConversationIdChangeBecauseOfNew(true)
    setCurrInputs(inputs)
    setChatStarted()
    // parse variables in introduction
    setChatList(generateNewChatListWithOpenStatement('', inputs))
    // 同步更新新会话名称
    setNewConversationInfo({
      name: newName,
      introduction: conversationIntroduction,
    })
  }

  const hasSetInputs = (() => {
    if (!isNewConversation)
      return true

    return isChatStarted
  })()

  const conversationName = currConversationInfo?.name || t('app.chat.newChatDefaultName') as string
  const conversationIntroduction = currConversationInfo?.introduction || ''

  const createNewChat = (newName?: string) => {
    // if new chat is already exist, do not create new chat
    if (conversationList.some(item => item.id === '-1'))
      return

    const finalName = newName || generatePersistentNewConversationName();

    setConversationList(produce(conversationList, (draft) => {
      draft.unshift({
        id: '-1',
        name: finalName,
        inputs: newConversationInputs,
        introduction: conversationIntroduction,
      })
    }))

    // 保存新名称到会话信息
    setNewConversationInfo({
      name: finalName,
      introduction: conversationIntroduction,
    });
  }

  // 清理存储的新对话名称
  const clearNewConversationNameStorage = useCallback(() => {
    if (APP_ID) {
      const storageKey = `newConversationName_${APP_ID}`;
      localStorage.removeItem(storageKey);
    }
  }, [APP_ID]);

  // 在对话完成或组件卸载时清理 localStorage
  useEffect(() => {
    return () => {
      clearNewConversationNameStorage();
    }
  }, [clearNewConversationNameStorage]);

  // 处理导出对话的函数
  const handleExportConversation = () => {
    const conversation = conversationList.find(item => item.id === currConversationId)
    if (!conversation)
      return

    const chatHistory = {
      conversation: {
        id: conversation.id,
        name: conversation.name,
        introduction: conversation.introduction,
        createdAt: new Date().toISOString(),
      },
      messages: chatList,
    }

    const dataStr = JSON.stringify(chatHistory, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${conversation.name || 'conversation'}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 剩余的代码保持不变，只需在 Header 组件中添加 onExport 属性
  // 在 Header 组件中这样调用：
  // <Header
  //   title={APP_INFO.title}
  //   isMobile={isMobile}
  //   onShowSideBar={showSidebar}
  //   onCreateNewChat={() => handleConversationIdChange('-1')}
  //   onExport={handleExportConversation}
  // />

  // 其余的代码和之前完全一致，这里我省略了大部分实现细节
  // ...

  return (
    <div className='bg-gray-100'>
      <Header
        title={APP_INFO.title}
        isMobile={isMobile}
        onShowSideBar={showSidebar}
        onCreateNewChat={() => handleConversationIdChange('-1')}
        onExport={handleExportConversation}
      />
      {/* 其余部分保持不变 */}
    </div>
  )
}

export default React.memo(Main)