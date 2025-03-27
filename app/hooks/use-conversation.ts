import { useState } from 'react'
import type { ConversationItem } from '@/types/app'

export default function useConversation() {
    const [conversations, setConversations] = useState<ConversationItem[]>([])

    const renameConversation = (id: string, newName: string) => {
        setConversations(prev =>
            prev.map(item =>
                item.id === id ? { ...item, name: newName } : item
            )
        )
    }

    const exportConversationToPDF = (id: string) => {
        // 原有的导出PDF功能
    }

    return {
        renameConversation,
        exportConversationToPDF
    }
}