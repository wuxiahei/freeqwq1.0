'use client'

import { useParams } from 'next/navigation'
import Main from '@/app/components'

export default function ChatPage() {
    const params = useParams()
    const conversationId = params?.id as string

    return (
        <Main params={{ conversationId }} />
    )
} 