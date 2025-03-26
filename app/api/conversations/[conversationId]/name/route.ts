import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

/**
 * 处理对话重命名的POST请求
 * @param request 请求对象
 * @param params 路由参数，包含conversationId
 * @returns 返回重命名后的对话信息
 */
export async function POST(request: NextRequest, { params }: {
  params: { conversationId: string }
}) {
  // 解析请求体
  const body = await request.json()
  const {
    auto_generate,  // 是否自动生成名称
    name,           // 新名称
  } = body
  const { conversationId } = params
  
  // 获取用户信息
  const { user } = getInfo(request)

  // 调用API重命名对话
  const { data } = await client.renameConversation(conversationId, name, user, auto_generate)
  
  // 返回响应
  return NextResponse.json(data)
}
