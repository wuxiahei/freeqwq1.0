import { useState } from 'react'
import produce from 'immer'
import { useGetState } from 'ahooks'
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
            // 确保UI立即更新
            forceUpdate()
        } catch (error) {
            console.error('Failed to rename conversation:', error)
            throw error // 抛出错误以便调用方处理
        }
    }

    const exportConversationToPDF = async (id: string) => {
        try {
            await client.exportConversationToPDF(id)
        } catch (error) {
            console.error('Failed to export conversation to PDF:', error)
            throw error
        }
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