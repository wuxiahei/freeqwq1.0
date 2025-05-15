import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, getUserName } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: { messageId: string }
}) {
  const body = await request.json()
  const {
    rating,
  } = body
  const { messageId } = await params
  const { user, headers } = getInfo(request,  getUserName())
  const { data } = await client.messageFeedback(messageId, rating, user)
  return NextResponse.json(data, { 
    headers: { 
      ...headers, 
    } 
  })
}
