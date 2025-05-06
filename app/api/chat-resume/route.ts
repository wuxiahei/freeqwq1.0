import { type NextRequest } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    conversation_id: conversationId,
    last_chunk_id: lastChunkId,
  } = body
  const { user } = getInfo(request)
  
  try {
    // 设置较长的超时时间
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分钟超时
    
    // 调用恢复聊天的API
    const res = await client.resumeChatStream(
      conversationId,
      lastChunkId,
      user,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    return new Response(res.data as any);
  } catch (error) {
    console.error('Error resuming chat stream:', error);
    
    return new Response(
      JSON.stringify({ 
        error: '恢复聊天失败，请重试', 
        code: 'RESUME_FAILED' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}