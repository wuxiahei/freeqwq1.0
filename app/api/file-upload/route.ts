import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { client, getInfo, getUserName } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { user, headers } = getInfo(request, getUserName())
    formData.append('user', user)
    const { data } = await client.fileUpload(formData)
    return NextResponse.json(data, { 
      headers: { 
        ...headers, 
      } 
    })
  }
  catch (e: any) {
    return NextResponse.json(e.message)
  }
}
