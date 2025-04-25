import { type NextRequest, NextResponse } from 'next/server'
import { clients, getInfo } from '@/app/api/utils/common'

export async function DELETE(request: NextRequest, { params }: {
    params: { conversationId: string }
}) {
    const { conversationId } = params
    const { user } = getInfo(request)
    const { app_id: appId } = await request.json()
    const { data } = await clients[appId].deleteConversation(conversationId, user)
    return NextResponse.json(data)
} 