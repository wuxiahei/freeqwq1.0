'use client'
import React from 'react'

// 设备类型枚举定义
export enum MediaType {
  mobile = 'mobile',  // 移动设备
  tablet = 'tablet',  // 平板设备
  pc = 'pc',          // 桌面设备
}

// 自定义hook，用于获取当前设备的断点类型
const useBreakpoints = () => {
  // 获取当前窗口宽度
  const [width, setWidth] = React.useState(globalThis.innerWidth)
  
  // 根据窗口宽度判断设备类型
  const media = (() => {
    if (width <= 640)
      return MediaType.mobile
    if (width <= 768)
      return MediaType.tablet
    return MediaType.pc
  })()

  // 监听窗口大小变化
  React.useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  return media
}

export default useBreakpoints
