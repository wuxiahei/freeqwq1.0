import { type NextRequest } from 'next/server'
import { clients, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    inputs,
    query,
    files,
    conversation_id: conversationId,
    response_mode: responseMode,
    app_id: appId
  } = body
  const { user } = await getInfo(request)
  console.log('appId', appId)
  const selectedClient = clients[appId]
  const res = await selectedClient.createChatMessage(inputs, query, user, responseMode, conversationId, files)
  return new Response(res.data as any)
}
