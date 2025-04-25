import { NextResponse } from 'next/server'
import { PPTService } from '@/service/ppt'

export async function GET() {
    try {
        const pptService = PPTService.getInstance()
        const token = await pptService.createToken('xxx')
        return NextResponse.json({ token })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to refresh token' },
            { status: 500 }
        )
    }
} 