export const PPT_CONFIG = {
    // 生产环境配置
    PROD: {
        BASE_URL: 'https://docmee.cn',
        API_KEY: process.env.NEXT_PUBLIC_DOCMEE_API_KEY,
    },
    // 开发环境配置
    DEV: {
        BASE_URL: 'https://docmee.cn',
        API_KEY: process.env.NEXT_PUBLIC_DOCMEE_API_KEY,
    }
} 