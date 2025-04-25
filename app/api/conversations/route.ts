import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { clients, getInfo, setSession } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { sessionId, user } = getInfo(request)
  try {
    const { searchParams } = new URL(request.url)
    const appId = searchParams.get('app_id')
    if (!appId) {
      return NextResponse.json({ error: 'app_id is required' }, { status: 400 })
    }
    const { data }: any = await clients[appId].getConversations(user)
    console.log('sessionId', sessionId, 'data', data)
    return NextResponse.json(data, {
      headers: setSession(sessionId),
    })
  }
  catch (error: any) {
    return NextResponse.json({
      data: [],
      error: error.message,
    })
  }
}
