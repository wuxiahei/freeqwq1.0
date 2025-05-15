import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession,  getUserName } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { user, sessionId, headers } = getInfo(request, getUserName())
  try {
    const { data } = await client.getInfo(user)
    // 接口未返回 建议从配置文件或者环境变量获取
    data.app_id = 'app_id'
    data.site = {
      "title": "Genrui AI Agent",
      "chat_color_theme": null,
      "chat_color_theme_inverted": false,
      "icon_type": "image",
      "icon": "48159ee8",
      "icon_background": "#E4FBCC",
      "icon_url": "http://127.0.0.1:8078/logo1.png",
      "description": "",
      "copyright": null,
      "privacy_policy": null,
      "custom_disclaimer": "",
      "default_language": "zh-Hans",
      "prompt_public": false,
      "show_workflow_steps": true,
      "use_icon_as_answer_icon": true
    }
    return NextResponse.json(data as object, {
      headers: { 
        ...headers, 
        ...setSession(sessionId) 
      } 
    })
  }
  catch (error) {
    return NextResponse.json([])
  }
}
