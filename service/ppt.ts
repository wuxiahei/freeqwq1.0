import axios from 'axios'
import { PPT_CONFIG } from '@/config/ppt-generator'

const isProd = process.env.NODE_ENV === 'production'
const config = isProd ? PPT_CONFIG.PROD : PPT_CONFIG.DEV

export class PPTService {
    private static instance: PPTService
    private token: string | null = null

    private constructor() { }

    static getInstance() {
        if (!PPTService.instance) {
            PPTService.instance = new PPTService()
        }
        return PPTService.instance
    }

    async createToken(uid: string) {
        if (!config.API_KEY) {
            throw new Error('DOCMEE_API_KEY is not configured')
        }

        try {
            const response = await axios.post(
                `${config.BASE_URL}/api/user/createApiToken`,
                { uid },
                {
                    headers: {
                        'Api-Key': config.API_KEY,
                        'Content-Type': 'application/json',
                    }
                }
            )

            if (response.data.code === 0) {
                this.token = response.data.data.token
                return this.token
            }
            throw new Error(response.data.message)
        } catch (error) {
            console.error('Failed to create PPT token:', error)
            throw error
        }
    }

    getToken() {
        return this.token
    }
} 