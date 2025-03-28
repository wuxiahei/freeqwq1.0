import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

export async function DELETE(request: NextRequest, { params }: { params: { conversationId: string } }) {
    const { sessionId, user } = getInfo(request)
    try {
        await client.deleteConversation(params.conversationId, user)
        return NextResponse.json({ success: true }, {
            headers: setSession(sessionId),
        })
    }
    catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 })
    }
}