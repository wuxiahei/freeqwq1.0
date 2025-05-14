import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: { messageId: string }
}) {
  const body = await request.json()
  const {
    rating,
  } = body
  const { messageId } = await params
// 从 inputs 中获取 name 参数
const userName = inputs?.name?.toString()  
// 获取用户信息，如果 getInfo 支持传入用户名，则传入
const { user } = getInfo(request, userName)
  const { data } = await client.messageFeedback(messageId, rating, user)
  return NextResponse.json(data)
}
