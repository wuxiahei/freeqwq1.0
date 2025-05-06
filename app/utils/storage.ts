// 保存聊天状态到本地存储
export const saveChatState = (conversationId: string, chunks: Map<string, string>, lastChunkId: string | null) => {
  if (!conversationId || !lastChunkId) return;
  
  try {
    localStorage.setItem(`chat_chunks_${conversationId}`, JSON.stringify(Array.from(chunks.entries())));
    localStorage.setItem(`chat_last_chunk_${conversationId}`, lastChunkId);
  } catch (error) {
    console.error('Failed to save chat state:', error);
  }
};

// 从本地存储加载聊天状态
export const loadChatState = (conversationId: string) => {
  if (!conversationId) return { chunks: new Map(), lastChunkId: null };
  
  try {
    const chunksJson = localStorage.getItem(`chat_chunks_${conversationId}`);
    const lastChunkId = localStorage.getItem(`chat_last_chunk_${conversationId}`);
    
    const chunks = chunksJson ? new Map(JSON.parse(chunksJson)) : new Map();
    
    return { chunks, lastChunkId };
  } catch (error) {
    console.error('Failed to load chat state:', error);
    return { chunks: new Map(), lastChunkId: null };
  }
};

// 清除聊天状态
export const clearChatState = (conversationId: string) => {
  if (!conversationId) return;
  
  try {
    localStorage.removeItem(`chat_chunks_${conversationId}`);
    localStorage.removeItem(`chat_last_chunk_${conversationId}`);
  } catch (error) {
    console.error('Failed to clear chat state:', error);
  }
};