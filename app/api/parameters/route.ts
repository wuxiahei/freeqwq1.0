import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { user, sessionId, headers } = getInfo(request, userName)
  try {
    const { data } = await client.getApplicationParameters(user)
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
