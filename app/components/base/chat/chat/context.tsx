import React from 'react';

export const ChatContext = React.createContext(null);

export default function ChatProvider({ children }) {
    return <ChatContext.Provider value={null}>{children}</ChatContext.Provider>;
}