import type { FC } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from '@/app/components/base/toast'

interface AuthProps {
    onAuthSuccess: () => void
}

const Auth: FC<AuthProps> = ({ onAuthSuccess }) => {
    const { t } = useTranslation()
    const [username, setUsername] = useState('1')
    const [password, setPassword] = useState('1')
    const { notify } = Toast

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // 简单验证逻辑
        if (!username || !password) {
            notify({ type: 'error', message: t('auth.errorMessage.required'), duration: 3000 })
            return
        }

        // 认证成功回调
        onAuthSuccess()
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-center text-gray-900">{t('auth.title')}</h2>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                {t('auth.username')}
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {t('auth.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {t('auth.login')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Auth