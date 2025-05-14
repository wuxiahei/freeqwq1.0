import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userName = formData.get('name')?.toString() // 从表单数据中获取用户输入的名称
    
    const { user: defaultUser, sessionId } = getInfo(request)
    // 如果用户提供了名称，则使用它；否则使用默认生成的用户标识符
    const user = userName ? `user_${APP_ID}:${userName}` : defaultUser
    
    formData.append('user', user)
    const { data } = await client.aduioToText(formData)
    return NextResponse.json(data)
  }
  catch (e: any) {
    return NextResponse.json(e.message)
  }
}
