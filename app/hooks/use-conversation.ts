import { useState } from 'react'
import produce from 'immer'
import { useGetState } from 'ahooks'
import type { ConversationItem } from '@/types/app'
import client from '@/lib/client'

const renameConversation = async (id: string, newName: string) => {
    try {
        await client.renameConversation(id, newName)
        setConversationList(prev =>
            produce(prev, draft => {
                const index = draft.findIndex(item => item.id === id)
                if (index !== -1)
                    draft[index].name = newName
            })
        )
    } catch (error) {
        console.error('Failed to rename conversation:', error)
        throw error
    }
}

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
            setConversations(prev => prev.filter(item => item.id !== id))
        } catch (error) {
            console.error('Failed to delete conversation:', error)
            throw error
        }
    }

    return {
        renameConversation,
        exportConversationToPDF,
        deleteConversation
    }
}