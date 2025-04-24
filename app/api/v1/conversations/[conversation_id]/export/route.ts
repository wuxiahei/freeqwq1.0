import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import jsPDF from 'jspdf'

export async function GET(
  request: Request,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const { conversation_id } = params
    
    // 获取会话数据
    const conversation = await kv.get(`conversation:${conversation_id}`)
    const messages = await kv.get(`messages:${conversation_id}`)
    
    if (!conversation) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      )
    }

    // 创建PDF文档
    const doc = new jsPDF()
    
    // 设置标题
    doc.setFontSize(16)
    doc.text(conversation.name, 20, 20)
    
    // 添加消息内容
    doc.setFontSize(12)
    let yPosition = 40
    messages.forEach((message: any) => {
      doc.text(`${message.role}: ${message.content}`, 20, yPosition)
      yPosition += 10
    })
    
    // 生成PDF buffer
    const pdfBuffer = doc.output('arraybuffer')
    
    // 设置响应头
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="conversation-${conversation_id}.pdf"`)
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('导出PDF失败:', error)
    return NextResponse.json(
      { error: '导出PDF失败' },
      { status: 500 }
    )
  }
}