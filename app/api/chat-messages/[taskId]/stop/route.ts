import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: { taskId: string }
}) {
  const { taskId } = await params
  const { user, headers } = getInfo(request, userName)
  const { data } = await client.stopChat(taskId, user)
  return NextResponse.json(data, { 
    headers: { 
      ...headers, 
    } 
  })
}
