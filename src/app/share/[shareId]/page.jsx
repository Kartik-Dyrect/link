'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import LinkCard from '@/components/LinkCard'
import SearchAndFilter from '@/components/SearchAndFilter'
import { Loader, Grid, BookOpen, Share, Link as LinkIcon, Search } from 'lucide-react'

export default function SharePage() {
  const params = useParams()
  const shareId = params.shareId
  
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    if (shareId) {
      fetchCollection()
    }
  }, [shareId])

  const fetchCollection = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/collections?shareId=${shareId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Collection not found')
        }
        throw new Error('Failed to load collection')
      }
      
      const { collection } = await response.json()
      
      // Filter out any null or invalid links
      if (collection?.links) {
        collection.links = collection.links.filter(link => link && link.id && link.url)
      }
      
      setCollection(collection)
    } catch (error) {
      console.error('Error fetching collection:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter links based on search and category with additional null safety
  const filteredLinks = collection?.links?.filter(link => {
    // First check if link is valid
    if (!link || !link.id || !link.url) {
      return false
    }
    
    const matchesSearch = searchTerm === '' || 
      link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <BookOpen className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error === 'Collection not found' ? 'Collection Not Found' : 'Error Loading Collection'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base leading-relaxed">
            {error === 'Collection not found' 
              ? 'The collection you\'re looking for doesn\'t exist or has been removed.'
              : 'There was a problem loading this collection. Please try again later.'
            }
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center">
              <Share className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="ml-3 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {collection?.name || 'Shared Collection'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Public collection • {filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {filteredLinks.length === 0 && searchTerm === '' && selectedCategory === 'All' ? (
          <div className="text-center py-12 px-4">
            <Grid className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No links in this collection yet.</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              The owner hasn't added any links to this collection, or they have all been removed.
            </p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching links found.</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={() => {}} // No delete functionality for public view
                showDelete={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 