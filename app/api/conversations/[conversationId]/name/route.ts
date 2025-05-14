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
    user_name, // 添加用户名参数
  } = body
  const { conversationId } =  params
  const { user } = getInfo(request, user_name)

  // auto generate name
  const { data } = await client.renameConversation(conversationId, name, user, auto_generate )
  return NextResponse.json(data)
}
