import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

interface AppInfo {
  app_id: string
  site: {
    title: string
    "chat_color_theme": null,
    "chat_color_theme_inverted": false,
    "icon_type": "image",
    "icon": "48159ee8",
    "icon_background": "#E4FBCC",
    "icon_url": "http://127.0.0.1:8078/logo.png",
    "description": "-marsTest",
    "copyright": null,
    "privacy_policy": null,
    "custom_disclaimer": "",
    "default_language": "zh-Hans",
    "prompt_public": false,
    "show_workflow_steps": true,
    "use_icon_as_answer_icon": false
  }
}

export async function GET(request: NextRequest) {
  const { sessionId, user } = getInfo(request)
  try {
    const { data } = await client.getInfo(user)
    const defaultConfig: AppInfo = {
      app_id: process.env.APP_ID || 'app_id',
      site: {
        title: process.env.APP_TITLE || "Genrui AI Agent",
        "chat_color_theme": null,
        "chat_color_theme_inverted": false,
        "icon_type": "image",
        "icon": "48159ee8",
        "icon_background": "#E4FBCC",
        "icon_url": "http://127.0.0.1:8078/logo.png",
        "description": "-marsTest",
        "copyright": null,
        "privacy_policy": null,
        "custom_disclaimer": "",
        "default_language": "zh-Hans",
        "prompt_public": false,
        "show_workflow_steps": true,
        "use_icon_as_answer_icon": false
      }
    }
    return NextResponse.json({ ...defaultConfig, ...data }, {
      headers: setSession(sessionId),
    })
  }
  catch (error) {
    console.error('Error fetching app info:', error)
    return NextResponse.json(
      { error: 'Failed to load app info' },
      { status: 500 }
    )
  }
}
