'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, Share, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function ShareModal({ isOpen, onClose, user }) {
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const getAuthHeaders = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        throw new Error('Failed to get authentication session')
      }

      if (!session?.access_token) {
        throw new Error('No valid authentication token found')
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('Error getting auth headers:', error)
      throw error
    }
  }

  useEffect(() => {
    if (isOpen && user?.id) {
      generateShareUrl()
    } else if (isOpen && !user) {
      setError('Please wait for authentication to complete')
    }
  }, [isOpen, user])

  const generateShareUrl = async () => {
    if (!user || !user.id) {
      setError('User not authenticated - please try logging in again')
      return
    }

    setLoading(true)
    setError('')

    try {
      const headers = await getAuthHeaders()

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'My Collection'
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`Server error (${response.status}): ${errorText}`)
        }
        
        throw new Error(errorData.error || 'Failed to create shareable collection')
      }

      const { collection } = await response.json()
      
      if (!collection?.share_id) {
        throw new Error('Invalid collection response - missing share_id')
      }
      
      const url = `${window.location.origin}/share/${collection.share_id}`
      setShareUrl(url)

    } catch (error) {
      console.error('Error generating share URL:', error)
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      try {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        setError('Failed to copy to clipboard')
      }
    }
  }

  const openInNewTab = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  const handleClose = () => {
    setShareUrl('')
    setError('')
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white truncate pr-4">
            Share Your Collection
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 flex-shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base">Creating share link...</span>
            </div>
          ) : shareUrl ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Anyone with this link can view your collection publicly:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium flex items-center justify-center transition-colors duration-200 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={openInNewTab}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </button>
                <button
                  onClick={generateShareUrl}
                  className="px-4 py-2.5 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors duration-200"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : !user ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                Waiting for authentication...
              </div>
            </div>
          ) : null}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                {error}
              </div>
              <button
                onClick={generateShareUrl}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 underline font-medium"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 