'use client'

import { useState } from 'react'
import { Plus, Link as LinkIcon, Loader } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function AddLinkForm({ user, onLinkAdded }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getAuthHeaders = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new Error('Failed to get session: ' + error.message)
      }
      
      if (!session?.access_token) {
        throw new Error('No access token in session')
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('Auth headers error:', error)
      throw error
    }
  }

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return
    
    if (!validateUrl(trimmedUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Fetch metadata
      const metaResponse = await fetch('/api/fetch-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmedUrl }),
      })

      if (!metaResponse.ok) {
        const errorData = await metaResponse.json()
        throw new Error(errorData.error || 'Failed to fetch link metadata')
      }

      const metadata = await metaResponse.json()

      // Get auth headers
      const headers = await getAuthHeaders()

      // Save link to database
      const linkResponse = await fetch('/api/links', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: metadata.url,
          title: metadata.title,
          description: metadata.description,
          favicon: metadata.favicon,
          siteName: metadata.siteName,
          category: metadata.category,
        }),
      })

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json()
        throw new Error(errorData.error || 'Failed to save link')
      }

      const { link } = await linkResponse.json()

      setUrl('')
      onLinkAdded(link)

    } catch (error) {
      console.error('Error adding link:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    if (error) setError('')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Plus className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="truncate">Add New Link</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <>
              <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span>Adding Link...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span>Add Link</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
} 