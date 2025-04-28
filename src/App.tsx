import { DifyChatProvider } from '@dify-chat/core'
import { initResponsiveConfig } from '@dify-chat/helpers'
import FingerPrintJS from '@fingerprintjs/fingerprintjs'
import { useMount } from 'ahooks'
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom'
import { useState } from 'react'

import LayoutIndex from './layout'
import AppListPage from './pages/app-list'
import ChatPage from './pages/chat'
import { USER } from './config'

// 初始化响应式配置
initResponsiveConfig()

// 判断是否在 Vercel 环境中
const isVercel = process.env.VERCEL === '1'

/**
 * Dify Chat 的最小应用实例
 */
export default function App() {
	const [userId, setUserId] = useState<string>('')

	useMount(() => {
		// 模拟登录过程获取用户唯一标识
		const loadFP = async () => {
			const fp = await FingerPrintJS.load()
			const result = await fp.get()
			setUserId(result.visitorId)
		}
		loadFP()
	})

	return (
		<Router basename={isVercel ? '/' : '/dify-chat'}>
			<DifyChatProvider
				value={{
					mode: 'singleApp',
					user: USER,
					// 默认使用 localstorage, 如果需要使用其他存储方式，可以实现 DifyAppStore 接口后传入，异步接口实现参考 src/services/app/restful.ts
					appService: {
						requestConfig: {
							apiBase: `${process.env.NEXT_PUBLIC_API_URL}`,
							apiKey: `${process.env.NEXT_PUBLIC_APP_KEY}`,
						},
					}
				}}
			>
				<LayoutIndex />
				<Routes>
					<Route path="/chat" element={<ChatPage />} />
					<Route path="/app/:appId" element={<ChatPage />} />
					<Route path="/apps" element={<AppListPage />} />
				</Routes>
			</DifyChatProvider>
		</Router>
	)
}
