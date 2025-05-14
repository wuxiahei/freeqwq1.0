import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
      // 从 inputs 中获取 name 参数
    const userName = inputs?.name?.toString()  
// 获取用户信息，如果 getInfo 支持传入用户名，则传入
    const { user } = getInfo(request, userName)
    formData.append('user', user)
    const { data } = await client.fileUpload(formData)
    return NextResponse.json(data)
  }
  catch (e: any) {
    return NextResponse.json(e.message)
  }
}
