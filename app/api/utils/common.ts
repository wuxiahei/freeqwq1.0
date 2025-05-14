import { type NextRequest } from 'next/server'
import { ChatClient } from 'dify-client-plus'
import { v4 } from 'uuid'
import { API_KEY, API_URL, APP_ID } from '@/config'
import { kv } from '@vercel/kv'

const userPrefix = `user_${APP_ID}:`
const USER_NAME_PREFIX = 'user_name:'

export const getInfo = async (request: NextRequest, userName?: string) => {
  const sessionId = request.cookies.get('session_id')?.value || v4()
  
  // 从 KV 存储获取用户名
  const key = `${USER_NAME_PREFIX}${sessionId}`
  let storedUserName = await kv.get(key)
  
  // 如果提供了新的用户名且没有存储的用户名，则存储新的用户名
  if (userName && !storedUserName) {
    await kv.set(key, userName)
    storedUserName = userName
  }
  
  // 构建用户标识符
  const user = "name" + (storedUserName || userName ? ":" + (storedUserName || userName) : "")
  
  return {
    sessionId,
    user,
  }
}

export const setSession = (sessionId: string) => {
  return { 'Set-Cookie': `session_id=${sessionId}` }
}

export const client = new ChatClient(API_KEY, API_URL || undefined)
