'use client'
import type { FC } from 'react'
import React, { useState } from 'react'
import cn from 'classnames'
import s from './style.module.css'
import ImagePreview from '@/app/components/base/image-uploader/image-preview'

type Props = {
  srcs: string[]
}

const getWidthStyle = (imgNum: number) => {
  if (imgNum === 1) {
    return {
      maxWidth: '100%',
    }
  }

  if (imgNum === 2 || imgNum === 4) {
    return {
      width: 'calc(50% - 4px)',
    }
  }

  return {
    width: 'calc(33.3333% - 5.3333px)',
  }
}
import { API_URL } from '@/config'

const ImageGallery: FC<Props> = ({
  srcs,
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  // 处理 URL 拼接
  const getFullUrl = (src: string) => {
    // 如果是 base64 或者完整的 http URL，直接返回
    if (src.startsWith('data:') || src.startsWith('http')) {
      return src
    }
    // 移除 API_URL 末尾的 /v1（如果有）
    const baseUrl = API_URL.replace(/\/v1$/, '')
    // 确保 src 以 / 开头
    const path = src.startsWith('/') ? src : `/${src}`
    return `${baseUrl}${path}`
  }

  const imgNum = srcs.length
  const imgStyle = getWidthStyle(imgNum)
  return (
    <div className={cn(s[`img-${imgNum}`], 'flex flex-wrap')}>
      {srcs.map((src, index) => (
        <img
          key={index}
          className={s.item}
          style={imgStyle}
          src={getFullUrl(src)}
          alt=''
          onClick={() => setImagePreviewUrl(getFullUrl(src))}
        />
      ))}
      {
        imagePreviewUrl && (
          <ImagePreview
            url={imagePreviewUrl}
            onCancel={() => setImagePreviewUrl('')}
          />
        )
      }
    </div>
  )
}
// const ImageGallery: FC<Props> = ({
//   srcs,
// }) => {
//   const [imagePreviewUrl, setImagePreviewUrl] = useState('')

//   const imgNum = srcs.length
//   const imgStyle = getWidthStyle(imgNum)
//   return (
//     <div className={cn(s[`img-${imgNum}`], 'flex flex-wrap')}>
//       {/* TODO: support preview */}
//       {srcs.map((src, index) => (
//         <img
//           key={index}
//           className={s.item}
//           style={imgStyle}
//           src={src}
//           alt=''
//           onClick={() => setImagePreviewUrl(src)}
//         />
//       ))}
//       {
//         imagePreviewUrl && (
//           <ImagePreview
//             url={imagePreviewUrl}
//             onCancel={() => setImagePreviewUrl('')}
//           />
//         )
//       }
//     </div>
//   )
// }

export default React.memo(ImageGallery)

export const ImageGalleryTest = () => {
  const imgGallerySrcs = (() => {
    const srcs = []
    for (let i = 0; i < 6; i++)
      // srcs.push('https://placekitten.com/640/360')
      // srcs.push('https://placekitten.com/360/640')
      srcs.push('https://placekitten.com/360/360')

    return srcs
  })()
  return (
    <div className='space-y-2'>
      {imgGallerySrcs.map((_, index) => (
        <div key={index} className='p-4 pb-2 rounded-lg bg-[#D1E9FF80]'>
          <ImageGallery srcs={imgGallerySrcs.slice(0, index + 1)} />
        </div>
      ))}
    </div>
  )
}
