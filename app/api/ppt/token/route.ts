import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { uid, limit } = await request.json()
    const apiKey = process.env.VITE_DOCMEE_API_KEY

    const headers: HeadersInit = {
        'Api-Key': apiKey || '',
        'Content-Type': 'application/json'
    }

    try {
        const response = await fetch('https://docmee.cn/api/user/createApiToken', {
            method: 'POST',
            headers,
            body: JSON.stringify({ uid, limit })
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({
            code: -1,
            message: 'Token creation failed'
        }, { status: 500 })
    }
} 