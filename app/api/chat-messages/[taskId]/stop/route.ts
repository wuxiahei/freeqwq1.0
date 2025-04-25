import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { clients, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
    params: { taskId: string }
}) {
    const { taskId } = params
    const { user } = getInfo(request)
    const { app_id: appId } = await request.json()

    const { data } = await clients[appId].stopChatMessageResponding(taskId, user)
    return NextResponse.json(data)

}
