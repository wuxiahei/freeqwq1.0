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

    const exportConversationToPDF = (id: string) => {
        // 原有的导出PDF功能
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