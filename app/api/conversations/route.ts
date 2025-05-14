import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
   // 从 inputs 中获取 name 参数
   const userName = inputs?.name?.toString()
    
   // 获取用户信息，如果 getInfo 支持传入用户名，则传入
   const { sessionId, user } = getInfo(request, userName)
  try {
    const { data }: any = await client.getConversations(user)
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
