'use client'

import Main from '@/app/components'
import { useEffect } from 'react'
import { updateConfig } from '@/config'

export default function NewAiPlusChatPage({ params }: { params: { appId: string } }) {
    useEffect(() => {
        // 只有当存储的appId与当前不同时才更新
        const storedAppId = window.localStorage.getItem('x-app-id');
        console.log('storedAppId', storedAppId)
        if (storedAppId !== params.appId) {
            updateConfig(params.appId);
            window.localStorage.setItem('x-app-id', params.appId);
        }
    }, [params.appId]);

    return (
        <Main params={{ conversationId: '-1', isNewChat: true, appId: params.appId }} />
    )
} 