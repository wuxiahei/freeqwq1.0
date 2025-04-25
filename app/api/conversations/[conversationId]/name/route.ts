import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { clients, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: { conversationId: string }
}) {
  const body = await request.json()
  const {
    auto_generate,
    name,
    app_id: appId
  } = body
  const { conversationId } = params
  const { user } = getInfo(request)

  // auto generate name
  const { data } = await clients[appId].renameConversation(conversationId, name, user, auto_generate)
  console.log(data)
  return NextResponse.json(data)
}
