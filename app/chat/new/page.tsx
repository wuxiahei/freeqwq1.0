'use client'

import Main from '@/app/components'

export default function NewChatPage() {

    window.localStorage.setItem('x-app-id', '43192a18-2b15-451e-9aec-37d55d5673db');
    return (
        <Main params={{ conversationId: '-1', isNewChat: true }} />
    )
} 