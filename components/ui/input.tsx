'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2',
            error ? 'border-brand-orange focus:border-brand-orange' : 'border-zinc-200 focus:border-brand-teal',
            'focus:outline-none transition-colors',
            'placeholder:text-zinc-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-brand-orange text-sm mt-1.5">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
