'use client'
import type { FC } from 'react'
import React from 'react'
import s from './style.module.css'

export type ILoaidingAnimProps = {
  type: 'text' | 'avatar'
}

const LoadingAnim: FC<ILoaidingAnimProps> = ({
  type,
}) => {
  return (
    <div className="flex items-center gap-2">
      {type === 'text' && (
        <span className="text-sm text-gray-500">正在思考</span>
      )}
      <div className={`${s['dot-flashing']} ${s[type]}`}></div>
    </div>
  )
}
export default React.memo(LoadingAnim)
