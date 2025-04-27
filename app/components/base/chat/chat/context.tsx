'use client'

import { createContext, useContext } from 'react'

export type ChatContextType = {
  onSend?: (message: string) => void
}

const ChatContext = createContext<ChatContextType>({
  onSend: undefined,
})

export const useChatContext = () => useContext(ChatContext)

export default ChatContext