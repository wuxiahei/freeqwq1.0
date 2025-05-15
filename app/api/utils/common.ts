import { type NextRequest } from 'next/server'
import { ChatClient } from 'dify-client-plus'
import { v4 } from 'uuid'
import { API_KEY, API_URL, APP_ID } from '@/config'

const userPrefix = `user_${APP_ID}:`
const USER_NAME_COOKIE = 'user_name'

// 添加一个模块级变量来存储最后使用的用户名
let lastUserName: string | undefined;

// 添加获取和设置用户名的函数
export const getUserName = () => lastUserName;
export const setUserName = (name?: string) => {
  if (name) {
    lastUserName = name;
  }
  return lastUserName;
};

export const getInfo = (request: NextRequest, userName?: string) => {
  // 如果提供了用户名，则更新最后使用的用户名
  if (userName) {
    setUserName(userName);
  }
  
  const sessionId = request.cookies.get('session_id')?.value || v4()
  
  // 从 cookie 中获取存储的用户名
  let storedUserName = request.cookies.get(USER_NAME_COOKIE)?.value
  
  // 如果提供了新的用户名且没有存储的用户名，则使用新的用户名
  const finalUserName = storedUserName || userName || lastUserName
  
  // 构建用户标识符
  const user = userPrefix + sessionId + (finalUserName ? ":" + finalUserName : "")
  
  // 准备响应头
  const headers: Record<string, string> = {}
  if (userName && !storedUserName) {
    headers['Set-Cookie'] = `${USER_NAME_COOKIE}=${userName}; Path=/; SameSite=Strict; HttpOnly`
  }
  
  return {
    sessionId,
    user,
    headers
  }
}

export const setSession = (sessionId: string) => {
  return { 'Set-Cookie': `session_id=${sessionId}` }
}

// 添加重置用户名的函数
export const resetUserName = () => {
  lastUserName = undefined;
  return { 'Set-Cookie': `${USER_NAME_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT` }
}

export const client = new ChatClient(API_KEY, API_URL || undefined)
