import { useState } from 'react'
import type { ConversationItem } from '@/types/app'
import client from '@/lib/client'

export default function useConversation() {
    const [conversations, setConversations] = useState<ConversationItem[]>([])

    const renameConversation = async (id: string, newName: string) => {
        try {
            await client.renameConversation(id, newName)
        } catch (error) {
            console.error('Failed to rename conversation:', error)
        }
    }

    const exportConversationToPDF = async (id: string) => {
        try {
            await client.getConversationDetail(id)
            // The client method already triggers the PDF download
        } catch (error) {
            console.error('导出PDF失败:', error)
        }
    }

    const deleteConversation = async (id: string) => {
        try {
            await client.deleteConversation(id)
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