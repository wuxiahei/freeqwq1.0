import { type NextRequest } from 'next/server'
import { ChatClient } from 'dify-client-plus'
import { v4 } from 'uuid'
import { API_KEY, API_URL, APP_ID } from '@/config'

//const userPrefix = `user_${APP_ID}:`

// 添加一个全局变量来存储最后使用的用户名
//let lastUserName: string | undefined

export const getInfo = (request: NextRequest, userName?: string) => {
  // 如果提供了用户名，则更新最后使用的用户名
 /* if (userName) {
    lastUserName = userName
  }*/
  
  const sessionId0 = request.cookies.get('session_id')?.value || v4()
  // 优先使用传入的用户名，其次使用最后使用的用户名，最后使用会话ID
  const sessionId = sessionId0  +  (userName ? ":" + (userName) : "")
  const user = sessionId
 // const user = "name" + (userName || lastUserName ? ":" + (userName || lastUserName) : "")
  return {
    sessionId,
    user,
  }
}

export const setSession = (sessionId: string) => {
  return { 'Set-Cookie': `session_id=${sessionId}` }
}

export const client = new ChatClient(API_KEY, API_URL || undefined)
