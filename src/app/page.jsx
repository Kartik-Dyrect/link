'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import AuthForm from '@/components/AuthForm'
import AddLinkForm from '@/components/AddLinkForm'
import LinkCard from '@/components/LinkCard'
import SearchAndFilter from '@/components/SearchAndFilter'
import ShareModal from '@/components/ShareModal'
import { Loader, Grid, BookOpen } from 'lucide-react'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [links, setLinks] = useState([])
  const [linksLoading, setLinksLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [authError, setAuthError] = useState('')

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    }
  }

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Auth error:', error)
          setAuthError(error.message)
        }

        setUser(session?.user ?? null)
        setLoading(false)

        if (session?.user) {
          fetchLinks()
        }
      })
      .catch((error) => {
        console.error('Auth session error:', error)
        setAuthError(error.message)
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchLinks()
      } else {
        setLinks([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchLinks = async () => {
    setLinksLoading(true)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/links', {
        headers
      })
      if (response.ok) {
        const { links } = await response.json()
        setLinks(links)
      } else {
        console.error('Failed to fetch links:', response.status)
      }
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLinksLoading(false)
    }
  }

  const handleLinkAdded = (newLink) => {
    setLinks(prev => [newLink, ...prev])
  }

  const handleLinkDelete = async (linkId) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/links?id=${linkId}`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        setLinks(prev => prev.filter(link => link.id !== linkId))
      } else {
        throw new Error('Failed to delete link')
      }
    } catch (error) {
      console.error('Error deleting link:', error)
      throw error
    }
  }

  const filteredLinks = links.filter(link => {
    const matchesSearch = searchTerm === '' || 
      link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md mx-auto">
          <p className="text-red-600 dark:text-red-400 mb-4 text-sm sm:text-base">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} onShareCollection={() => setShareModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <AddLinkForm user={user} onLinkAdded={handleLinkAdded} />

        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center">
              <Grid className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                My Links
              </h2>
              <span className="ml-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs sm:text-sm font-medium px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full">
                {filteredLinks.length}
              </span>
            </div>
          </div>

          {linksLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No links yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm sm:text-base">
                Start building your collection by adding your first link above.
              </p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No links found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm sm:text-base">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDelete={handleLinkDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        user={user}
      />
    </div>
  )
} 