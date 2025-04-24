// ... existing code ...
async deleteConversation(conversationId: string) {
  const response = await fetch(`/api/v1/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: this.userId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '删除会话失败')
  }

  return response.json()
}
// ... existing code ...