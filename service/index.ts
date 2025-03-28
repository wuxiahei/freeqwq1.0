import axios, { AxiosHeaders } from 'axios'

import type {
  IOnCompleted,
  IOnData,
  IOnError,
  IOnFile,
  IOnMessageEnd,
  IOnMessageReplace,
  IOnNodeFinished,
  IOnNodeStarted,
  IOnThought,
  IOnWorkflowFinished,
  IOnWorkflowStarted,
} from './base'
import { get, post, ssePost } from './base'
import type { Feedbacktype, ParametersRes } from '@/types/app'
import { API_URL, API_ORG_URL } from '@/config'
import { headersMap, returnAgentType } from '@/utils'

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
  return ssePost('chat-messages', {
    body: {
      ...body,
      response_mode: 'streaming',
    },
  }, {
    onData,
    onCompleted,
    onThought,
    onFile,
    onError,
    getAbortController,
    onMessageEnd,
    onMessageReplace,
    onNodeStarted,
    onWorkflowStarted,
    onWorkflowFinished,
    onNodeFinished,
  })
}

export const fetchConversations = async () => {
  return get('conversations', { params: { limit: 100, first_id: '' } })
}

export const fetchChatList = async (conversationId: string) => {
  return get('messages', { params: { conversation_id: conversationId, limit: 20, last_id: '' } })
}

// 添加接口相应类型 ParametersRes
export const fetchAppParams = async (): Promise<ParametersRes> => {
  const response = await get('parameters')
  return response as ParametersRes
}

export const updateFeedback = async ({ url, body }: { url: string; body: Feedbacktype }) => {
  return post(url, { body })
}

export const generationConversationName = async (id: string) => {
  return post(`conversations/${id}/name`, { body: { auto_generate: true } })
}

const commonFetch = async (url: string, method: string, headers: HeadersInit, body?: any) => {
  const axiosHeaders = new AxiosHeaders()
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      axiosHeaders.set(key, value)
    })
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      axiosHeaders.set(key, value)
    })
  } else {
    Object.entries(headers).forEach(([key, value]) => {
      axiosHeaders.set(key, value)
    })
  }

  const options = {
    method,
    headers: axiosHeaders,
    data: null,
  }
  if (body) {
    options.data = body
  }
  try {
    const response = await axios(url, options)
    if (!response.status || response.status >= 400) {
      return new Error(`HTTP error! status: ${response.status}`)
    }
    return response.data.resultData
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

