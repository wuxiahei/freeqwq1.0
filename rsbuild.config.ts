import { defineConfig } from '@rsbuild/core'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginReact } from '@rsbuild/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'

const tsconfigDevPath = path.resolve(__dirname, './tsconfig.json')
const tsconfigProdPath = path.resolve(__dirname, './tsconfig.prod.json')

// 判断是否在 Vercel 环境中
const isVercel = process.env.VERCEL === '1'

export default defineConfig({
	source: {
		tsconfigPath: process.env.NODE_ENV === 'development' ? tsconfigDevPath : tsconfigProdPath,
	},
	html: {
		template: path.resolve(__dirname, './public/template.html'),
	},
	plugins: [
		pluginReact(),
		pluginLess({
			lessLoaderOptions: {
				lessOptions: {
					plugins: [],
					javascriptEnabled: true,
				},
			},
		}),
	],
	server: {
		compress: false, // 解决代理后流式输出失效的问题
		base: isVercel ? '/' : '/dify-chat',
		port: 5200,
		proxy: [
			{
				// 代理 Dify API
				target: process.env.DIFY_API_DOMAIN || 'https://api.dify.ai',
				changeOrigin: true,
				context: process.env.DIFY_API_PREFIX || '/v1',
			},
		],
	},
	tools: {
		postcss: {
			postcssOptions: {
				plugins: [tailwindcss()],
			},
		},
	},
	output: {
		distPath: {
			root: 'dist',
		},
		// 在 Vercel 环境中修改公共路径
		publicPath: isVercel ? '/' : '/dify-chat/',
	},
})
