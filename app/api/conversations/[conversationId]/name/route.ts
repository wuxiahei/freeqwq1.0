import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: { conversationId: string }
}) {
  const body = await request.json()
  const {
    auto_generate,
    name,
  } = body
  const { conversationId } =  params
 // 从 inputs 中获取 name 参数
 const userName = inputs?.name?.toString()
    
 // 获取用户信息，如果 getInfo 支持传入用户名，则传入
 const { user } = getInfo(request, userName)

  // auto generate name
  const { data } = await client.renameConversation(conversationId, name, user, auto_generate )
  return NextResponse.json(data)
}
