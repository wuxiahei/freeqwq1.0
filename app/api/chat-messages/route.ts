import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'
import { APP_ID } from '@/config' 

// export const runtime = 'edge'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      inputs,
      query,
      files,
      conversation_id: conversationId,
      response_mode: responseMode,
    } = body
    
    // 从 inputs 中获取 name 参数
    const userName = inputs?.name?.toString()
    
    // 获取用户信息，如果 getInfo 支持传入用户名，则传入
    const { user, headers } = getInfo(request, userName)
    
    // 如果有用户名，则使用用户名构建用户标识符
   // const finalUser = userName ? `user_${APP_ID}:${userName}` : user
    
    const res = await client.createChatMessage(inputs, query, user, responseMode, conversationId, files)
    return new Response(res.data as any, { 
      headers: { 
        ...headers, 
      } 
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}
// export const runtime = 'edge'
/*export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    inputs,
    query,
    files,
    conversation_id: conversationId,
    response_mode: responseMode,
  } = body
  const { user } = getInfo(request)
  const res = await client.createChatMessage(inputs, query, user, responseMode, conversationId, files)
  return new Response(res.data as any)
}*/
