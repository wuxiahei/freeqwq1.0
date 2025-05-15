import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession, getUserName } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { sessionId, headers } = getInfo(request, getUserName())
  try {
    const { data } = await client.getMeta()
    return NextResponse.json(data as object, {
      headers: { 
        ...headers, 
        ...setSession(sessionId) 
      } 
    })
  }
  catch (error) {
    return NextResponse.json([])
  }
}
