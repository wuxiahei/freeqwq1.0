import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession, getUserName } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { user, sessionId, headers } = getInfo(request, getUserName())
  try {
    const { data }: any = await client.getConversations(user)
    return NextResponse.json(data, {
      headers: { 
        ...headers, 
        ...setSession(sessionId) 
      } 
    })
  }
  catch (error: any) {
    return NextResponse.json({
      data: [],
      error: error.message,
    })
  }
}
