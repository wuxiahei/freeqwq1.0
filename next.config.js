/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // enable browser source map generation during the production build
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    // appDir: true,
  },
  // fix all before production. Now it slow the develop speed.
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
    ignoreBuildErrors: true,
  },
  env: {
    VITE_DOCMEE_API_KEY: process.env.VITE_DOCMEE_API_KEY
  },
  // async rewrites() {
  //   return [
  //     {
  //       // 使用正则表达式匹配所有 /pages 下的路由
  //       source: '/:path*',
  //       // 将匹配到的路径重定向到 /pages 目录下
  //       destination: '/pages/:path*',
  //     },
  //   ]
  // },
}

module.exports = nextConfig
