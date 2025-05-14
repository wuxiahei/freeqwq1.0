import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function DELETE(request: NextRequest, { params }: {
  params: { conversationId: string }
}) {
  const { conversationId } = await params
 // 从 inputs 中获取 name 参数
 const userName = inputs?.name?.toString()
    
 // 获取用户信息，如果 getInfo 支持传入用户名，则传入
 const { user } = getInfo(request, userName)

  const { data } = await client.deleteConversation(conversationId, user)
  return NextResponse.json(data)
}