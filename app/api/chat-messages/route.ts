import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  try {
    // 解析请求体为 JSON
    const requestData = await request.json()
    
    // 从 inputs 中获取 name 参数
    const userName = requestData.inputs?.name?.toString()
    
    // 获取用户信息，传入用户名
    const { user } = getInfo(request, userName)
    
    // 将用户信息添加到请求数据中
    requestData.user = user
    
    // 调用 API 客户端
    const { data } = await client.chatMessages(requestData)
    
    return NextResponse.json(data)
  }
  catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}
// export const runtime = 'edge'
export async function POST(request: NextRequest) {
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
}
