import { Loader } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', className = '', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader className={`${sizeClasses[size]} animate-spin text-blue-600 mx-auto mb-2`} />
        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
        )}
      </div>
    </div>
  )
} 