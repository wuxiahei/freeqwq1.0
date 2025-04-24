import { APP_ID, API_KEY, API_URL } from '@/config'

class Client {
  private apiKey: string
  private userId: string
  
  constructor() {
    this.apiKey = API_KEY
    this.userId = `user_${APP_ID}`
  }

  async getConversationDetail(conversationId: string) {
    const response = await fetch(`/api/v1/conversations/${conversationId}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error('导出PDF失败')
    }

    // 获取blob数据
    const blob = await response.blob()
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${conversationId}.pdf`
    
    // 触发下载
    document.body.appendChild(a)
    a.click()
    
    // 清理
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
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
}

export default new Client()