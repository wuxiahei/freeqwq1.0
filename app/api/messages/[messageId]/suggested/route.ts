import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function GET(request: NextRequest, params: { messageId: string }) {
  const { messageId } = await params
// 从 inputs 中获取 name 参数
const userName = inputs?.name?.toString()  
// 获取用户信息，如果 getInfo 支持传入用户名，则传入
const { user } = getInfo(request, userName)
  const { data }: any = await client.getSuggested(messageId, user,)
  return NextResponse.json(data)
}
