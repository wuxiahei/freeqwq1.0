import React from 'react'
import type { TextareaHTMLAttributes } from 'react'
import classNames from 'classnames'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  block?: boolean
}

const Textarea: React.FC<TextareaProps> = ({
  className,
  block = false,
  ...props
}) => {
  return (
    <textarea
      className={classNames(
        'px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800 outline-none resize-none',
        'border border-transparent focus:border-primary-600 hover:border-gray-300',
        block ? 'w-full' : 'w-auto',
        className
      )}
      {...props}
    />
  )
}

export default Textarea