

// 添加恢复聊天流的方法
async resumeChatStream(
  conversationId: string,
  lastChunkId: string,
  user: any,
  options?: RequestInit
): Promise<any> {
  const url = `${this.baseUrl}/chat/resume`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-User-Id': user?.id || '',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      last_chunk_id: lastChunkId,
    }),
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`恢复聊天失败: ${response.status}`);
  }
  
  return {
    data: response.body,
  };
}