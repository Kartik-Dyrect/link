'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Trash2, Calendar } from 'lucide-react'
import { getCategoryColor } from '@/lib/categorizeLink'

export default function LinkCard({ link, onDelete, showDelete = true }) {
  const [imageError, setImageError] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this link?')) return
    
    setDeleting(true)
    try {
      await onDelete(link.id)
    } catch (error) {
      console.error('Failed to delete link:', error)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getFallbackImage = () => {
    return `https://via.placeholder.com/300x200/e5e7eb/6b7280?text=${encodeURIComponent(
      link.site_name || 'Link'
    )}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Image/Favicon */}
      <div className="relative h-40 sm:h-48 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
        {link.favicon && !imageError ? (
          <Image
            src={link.favicon}
            alt={link.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src={getFallbackImage()}
              alt={link.title}
              width={300}
              height={200}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${getCategoryColor(link.category)}`}>
            {link.category}
          </span>
        </div>
        
        {/* Delete Button */}
        {showDelete && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1 sm:p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-sm transition-colors duration-200 disabled:opacity-50"
              title="Delete link"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="space-y-2 sm:space-y-3 flex-1">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {link.title || 'Untitled'}
          </h3>
          
          {/* Description */}
          {link.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {link.description}
            </p>
          )}
          
          {/* Site Name */}
          {link.site_name && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 truncate">
              {link.site_name}
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
          {/* Date */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{formatDate(link.created_at)}</span>
          </div>
          
          {/* Visit Link Button */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 flex-shrink-0"
          >
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline">Visit</span>
          </a>
        </div>
      </div>
    </div>
  )
} 