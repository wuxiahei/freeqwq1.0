import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function DELETE(
  request: Request,
  { params }: { params: { conversation_id: string } }
) {
  try {
    // 验证请求头中的 Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { conversation_id } = params
    
    // 获取请求体数据
    const body = await request.json()
    const { user } = body

    // 验证用户权限（确保用户只能删除自己的会话）
    const conversation = await kv.get(`conversation:${conversation_id}`)
    if (!conversation || conversation.userId !== user) {
      return NextResponse.json(
        { error: '无权限删除该会话' },
        { status: 403 }
      )
    }

    // 删除会话及相关消息
    await kv.del(`conversation:${conversation_id}`)
    await kv.del(`messages:${conversation_id}`)
    
    return NextResponse.json({ 
      success: true,
      message: '会话删除成功'
    })
  } catch (error) {
    console.error('删除会话失败:', error)
    return NextResponse.json(
      { error: '删除会话失败' },
      { status: 500 }
    )
  }
}