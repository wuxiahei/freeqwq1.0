import type { IOnCompleted, IOnData, IOnError, IOnFile, IOnMessageEnd, IOnMessageReplace, IOnNodeFinished, IOnNodeStarted, IOnThought, IOnWorkflowFinished, IOnWorkflowStarted } from './base'
import { get, post, ssePost, del } from './base'
import type { Feedbacktype } from '@/types/app'

export const sendChatMessage = async (
  body: Record<string, any>,
  {
    onData,
    onCompleted,
    onThought,
    onFile,
    onError,
    getAbortController,
    onMessageEnd,
    onMessageReplace,
    onWorkflowStarted,
    onNodeStarted,
    onNodeFinished,
    onWorkflowFinished,
  }: {
    onData: IOnData
    onCompleted: IOnCompleted
    onFile: IOnFile
    onThought: IOnThought
    onMessageEnd: IOnMessageEnd
    onMessageReplace: IOnMessageReplace
    onError: IOnError
    getAbortController?: (abortController: AbortController) => void
    onWorkflowStarted: IOnWorkflowStarted
    onNodeStarted: IOnNodeStarted
    onNodeFinished: IOnNodeFinished
    onWorkflowFinished: IOnWorkflowFinished
  },
) => {
  console.log('Sending chat message with body:', body)
  try {
    const appId = window.localStorage.getItem('x-app-id') || '';
    return ssePost('chat-messages', {
      body: {
        ...body,
        response_mode: 'streaming',
        app_id: appId,
      },
    }, { onData, onCompleted, onThought, onFile, onError, getAbortController, onMessageEnd, onMessageReplace, onNodeStarted, onWorkflowStarted, onWorkflowFinished, onNodeFinished })
  } catch (error) {
    console.error('Error in sendChatMessage:', error)
    throw error
  }
}

export const fetchConversations = async () => {
  const appId = window.localStorage.getItem('x-app-id') || '43192a18-2b15-451e-9aec-37d55d5673db';
  return get('conversations', { params: { limit: 100, first_id: '', app_id: appId } })
}

export const fetchChatList = async (conversationId: string) => {
  const appId = window.localStorage.getItem('x-app-id') || '43192a18-2b15-451e-9aec-37d55d5673db';
  return get('messages', { params: { conversation_id: conversationId, limit: 20, last_id: '', app_id: appId } })
}

// init value. wait for server update
export const fetchAppParams = async () => {
  const appId = window.localStorage.getItem('x-app-id') || '43192a18-2b15-451e-9aec-37d55d5673db';
  return get('parameters', { params: { app_id: appId } })
}

export const updateFeedback = async ({ url, body }: { url: string; body: Feedbacktype }) => {
  const appId = window.localStorage.getItem('x-app-id') || '';
  return post(url, { body: { ...body, app_id: appId } })
}

export const generationConversationName = async (id: string, name?: string) => {
  const appId = window.localStorage.getItem('x-app-id') || '';
  console.log('generationConversationName', id, name)
  return post(`conversations/${id}/name`, {
    body: {
      auto_generate: false, // 如果提供了name就不自动生成
      name: name || '',
      app_id: appId
    }
  })
}

export const deleteConversation = async (id: string) => {
  const appId = window.localStorage.getItem('x-app-id') || '';
  return del(`conversations/${id}`, {
    body: {
      user: 'abc-123',  // 添加必需的 user 参数
      app_id: appId
    }
  })
}

export const stopChatMessageResponding = async (taskId: string) => {
  const appId = window.localStorage.getItem('x-app-id') || '';
  return post(`chat-messages/${taskId}/stop`, {
    body: {
      user: 'abc-123',
      app_id: appId
    }
  })
}
