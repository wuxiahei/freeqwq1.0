import { useState } from 'react'
import type { ConversationItem } from '@/types/app'
import client from '@/lib/client'

export default function useConversation() {
    const [conversations, setConversations] = useState<ConversationItem[]>([])

    const renameConversation = async (id: string, newName: string) => {
        try {
            await client.renameConversation(id, newName)
            setConversations(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, name: newName } : item
                )
            )
        } catch (error) {
            console.error('Failed to rename conversation:', error)
        }
    }

    const exportConversationToPDF = async (id: string) => {
        try {
            // 调用后端API获取对话内容
            const response = await client.getConversationDetail(id)
            
            // 使用第三方库如jsPDF生成PDF
            const doc = new jsPDF()
            
            // 添加对话内容到PDF
            doc.text(response.name, 10, 10)
            response.messages.forEach((message, index) => {
                doc.text(message.content, 10, 20 + index * 10)
            })
            
            // 下载PDF
            doc.save(`conversation-${id}.pdf`)
        } catch (error) {
            console.error('导出PDF失败:', error)
        }
    }

    const deleteConversation = async (id: string) => {
        try {
            await client.deleteConversation(id)
            setConversations(prev =>
                prev.filter(item => item.id !== id)
            )
        } catch (error) {
            console.error('Failed to delete conversation:', error)
        }
    }

    return {
        renameConversation,
        exportConversationToPDF,
        deleteConversation
    }
}