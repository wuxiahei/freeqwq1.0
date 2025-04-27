import React from 'react'
import type { InputHTMLAttributes } from 'react'
import classNames from 'classnames'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string
    block?: boolean
}

const Input: React.FC<InputProps> = ({
    className,
    block = false,
    ...props
}) => {
    return (
        <input
            className={classNames(
                'px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800 outline-none',
                'border border-transparent focus:border-primary-600 hover:border-gray-300',
                block ? 'w-full' : 'w-auto',
                className
            )}
            {...props}
        />
    )
}

export default Input