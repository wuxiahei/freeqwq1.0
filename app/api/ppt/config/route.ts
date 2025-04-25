import { NextResponse } from 'next/server'

export async function GET() {
    console.log('Environment variables:', {
        VITE_DOCMEE_API_KEY: process.env.VITE_DOCMEE_API_KEY,
        NODE_ENV: process.env.NODE_ENV
    });

    if (!process.env.VITE_DOCMEE_API_KEY) {
        return NextResponse.json({
            error: 'API Key not configured'
        }, { status: 500 });
    }

    return NextResponse.json({
        apiKey: process.env.VITE_DOCMEE_API_KEY
    })
} 