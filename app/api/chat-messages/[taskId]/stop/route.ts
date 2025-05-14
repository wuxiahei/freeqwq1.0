import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: { taskId: string }
}) {
  const { taskId } = await params
   // 从 inputs 中获取 name 参数
   const userName = inputs?.name?.toString()
    
   // 获取用户信息，如果 getInfo 支持传入用户名，则传入
   const { user } = getInfo(request, userName)
  const { data } = await client.stopChat(taskId, user)
  return NextResponse.json(data)
}
