'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getEntries, addEntry as addEntryToDB, updateEntry as updateEntryToDB, deleteEntry as deleteEntryFromDB, getLocalEntries, saveLocalEntries, getNonNegotiables, addNonNegotiable, updateNonNegotiable, deleteNonNegotiable, saveLocalNonNegotiables } from '../lib/dataService'
import JournalEntry from './components/JournalEntry'
import EntryList from './components/EntryList'
import NonNegotiables from './components/NonNegotiables'
import BookList from './components/BookList'
import TabContainer from './components/TabContainer'
import CosmicContextCompact from './components/CosmicContextCompact'
import ExportDropdown from './components/ExportData'
import ThemeToggle from './components/ThemeToggle'
import UserProfile from './components/UserProfile'
import Auth from './components/Auth'
import { X, Plus } from 'lucide-react'
import TekneIcon from './components/TekneIcon'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [entries, setEntries] = useState([])
  const [nonNegotiables, setNonNegotiables] = useState([])
  const [activeTab, setActiveTab] = useState('journal')

  // Handle tab changes with auto-save
  const handleTabChange = async (newTab) => {
    // If switching away from journal tab and we have unsaved entry data, save it
    if (activeTab === 'journal' && newTab !== 'journal' && currentEntryData && showJournalModal) {
      const hasContent = currentEntryData.activity?.trim() || 
                        currentEntryData.gratitude?.trim() || 
                        currentEntryData.presence?.trim() || 
                        currentEntryData.insights?.trim() || 
                        currentEntryData.wishFulfilled?.trim() || 
                        currentEntryData.aiResponse?.trim() ||
                        (currentEntryData.attachments && currentEntryData.attachments.length > 0)
      
      if (hasContent) {
        try {
          await addEntry(currentEntryData)
          console.log('Auto-saved entry when switching tabs')
          setToastMessage('Entry auto-saved')
          setTimeout(() => setToastMessage(null), 3000)
        } catch (error) {
          console.error('Failed to auto-save entry when switching tabs:', error)
          setToastMessage('Failed to auto-save entry')
          setTimeout(() => setToastMessage(null), 3000)
        }
      }
    }
    
    setActiveTab(newTab)
  }
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageComments, setImageComments] = useState({})
  const [showJournalModal, setShowJournalModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [currentEntryIndex, setCurrentEntryIndex] = useState(-1)
  const [currentEntryData, setCurrentEntryData] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState(null)

  // Check authentication status on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setLoading(false)
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    checkUser()

    return () => subscription.unsubscribe()
  }, [])

  // Load entries from database when user changes
  useEffect(() => {
    if (!user) {
      setEntries([])
      setNonNegotiables([])
      return
    }

    const loadData = async () => {
      try {
        const [dbEntries, dbNonNegotiables] = await Promise.all([
          getEntries(),
          getNonNegotiables()
        ])
        setEntries(dbEntries)
        setNonNegotiables(dbNonNegotiables)
      } catch (error) {
        console.warn('Failed to load from database, using local storage:', error)
        // Fallback to localStorage
        const localEntries = getLocalEntries()
        setEntries(localEntries)
        // Non-negotiables will be loaded from localStorage by the component
      }
    }
    
    loadData()
  }, [user])

  // Save entries to localStorage as backup whenever entries change
  useEffect(() => {
    try {
      saveLocalEntries(entries)
    } catch (error) {
      console.error('Failed to save entries to localStorage:', error)
      // Could add a toast notification here if needed
    }
  }, [entries])

  // Save non-negotiables to localStorage as backup whenever they change
  useEffect(() => {
    try {
      saveLocalNonNegotiables(nonNegotiables)
    } catch (error) {
      console.error('Failed to save non-negotiables to localStorage:', error)
    }
  }, [nonNegotiables])

  const addEntry = async (entry) => {
    try {
      console.log('addEntry called with editingEntry:', editingEntry) // Debug log
      
      if (editingEntry && editingEntry.id) {
        // Update existing entry
        console.log('Updating existing entry:', editingEntry.id) // Debug log
        const updatedEntry = {
          ...entry,
          id: editingEntry.id,
          timestamp: editingEntry.timestamp // Keep original timestamp
        }
        
        // Update in database
        await updateEntryToDB(editingEntry.id, updatedEntry)
        
        // Update local state
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? updatedEntry : e))
        
        // Clear editing state
        setEditingEntry(null)
      } else {
        // Add new entry
        console.log('Adding new entry') // Debug log
        const newEntry = {
          ...entry,
          id: Date.now(),
          timestamp: new Date().toISOString()
        }
        
        // Add to database
        const savedEntry = await addEntryToDB(newEntry)
        
        // Update local state
        setEntries(prev => [savedEntry, ...prev])
      }
      
      // Clear image comments after adding/updating entry
      setImageComments({})
      
      // Close the modal
      setShowJournalModal(false)
    } catch (error) {
      console.error('Failed to save entry:', error)
      // Fallback to local storage
      if (editingEntry && editingEntry.id) {
        const updatedEntry = {
          ...entry,
          id: editingEntry.id,
          timestamp: editingEntry.timestamp
        }
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? updatedEntry : e))
        setEditingEntry(null)
      } else {
        const newEntry = {
          ...entry,
          id: Date.now(),
          timestamp: new Date().toISOString()
        }
        setEntries(prev => [newEntry, ...prev])
      }
      setImageComments({})
      setShowJournalModal(false)
    }
  }



  const openImageModal = (attachment) => {
    setSelectedImage(attachment)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const updateImageComment = (imageId, comment) => {
    setImageComments(prev => ({
      ...prev,
      [imageId]: comment
    }))
  }



  const handleAuthChange = (user) => {
    setUser(user)
  }

  const handleSignOut = () => {
    setUser(null)
    setEntries([])
  }

  const openJournalModal = (entry = null) => {
    console.log('openJournalModal called with entry:', entry) // Debug log
    setEditingEntry(entry)
    
    // Find the index of the entry if it exists
    if (entry && entry.id) {
      const index = entries.findIndex(e => e.id === entry.id)
      setCurrentEntryIndex(index)
    } else {
      setCurrentEntryIndex(-1) // New entry
    }
    
    setShowJournalModal(true)
  }

  const closeJournalModal = () => {
    setShowJournalModal(false)
    // Delay clearing the editing entry to allow the modal to close smoothly
    setTimeout(() => {
      setEditingEntry(null)
      setCurrentEntryIndex(-1)
    }, 150)
  }

  const closeJournalModalWithSave = async (entryData) => {
    const dataToSave = entryData || currentEntryData
    
    // Check if there's actual content to save
    if (dataToSave) {
      const hasContent = dataToSave.activity?.trim() || 
                        dataToSave.gratitude?.trim() || 
                        dataToSave.presence?.trim() || 
                        dataToSave.insights?.trim() || 
                        dataToSave.wishFulfilled?.trim() || 
                        dataToSave.aiResponse?.trim() ||
                        (dataToSave.attachments && dataToSave.attachments.length > 0)
      
      if (hasContent) {
        try {
          await addEntry(dataToSave)
        } catch (error) {
          console.error('Failed to save entry when closing modal:', error)
        }
      }
    }
    
    setCurrentEntryData(null)
    closeJournalModal()
  }

  const navigateToNextEntry = () => {
    if (currentEntryIndex < entries.length - 1) {
      const nextIndex = currentEntryIndex + 1
      setCurrentEntryIndex(nextIndex)
      setEditingEntry(entries[nextIndex])
    }
  }

  const navigateToPreviousEntry = () => {
    if (currentEntryIndex > 0) {
      const prevIndex = currentEntryIndex - 1
      setCurrentEntryIndex(prevIndex)
      setEditingEntry(entries[prevIndex])
    }
  }

  const deleteEntry = async (id) => {
    try {
      // Delete from database
      await deleteEntryFromDB(id)
      
      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Failed to delete entry from database:', error)
      // Fallback to local state only
      setEntries(prev => prev.filter(entry => entry.id !== id))
    }
  }

  const updateEntry = async (entry) => {
    try {
      // Update in database
      await updateEntryToDB(entry.id, entry)
    } catch (error) {
      console.error('Failed to update entry in database:', error)
      throw error
    }
  }



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <Auth onAuthChange={handleAuthChange} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* App Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TekneIcon size={24} />
              <h1 className="text-2xl font-thin tracking-wide">TEKNE</h1>
            </div>
            <div className="flex items-center gap-4">
              <CosmicContextCompact />
              <ExportDropdown entries={entries} />
              <UserProfile user={user} onSignOut={handleSignOut} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-all duration-300 bg-green-500 text-white">
          {toastMessage}
        </div>
      )}

      {/* Floating Add Button */}
      {activeTab === 'journal' && (
        <button
          onClick={openJournalModal}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6 pt-32">
        <TabContainer activeTab={activeTab} onTabChange={handleTabChange}>
          {activeTab === 'journal' && (
            <EntryList 
              entries={entries} 
              onDeleteEntry={deleteEntry}
              onEditEntry={openJournalModal}
              title="Journal Entries"
            />
          )}
          {activeTab === 'non-negotiables' && (
            <NonNegotiables 
              items={nonNegotiables}
              onUpdateItems={setNonNegotiables}
            />
          )}
          {activeTab === 'books' && (
            <BookList 
              userProfile={{
                id: user?.id,
                email: user?.email,
                primaryGoals: 'trading, financial, personal development', // Default goals
                doshaBalance: null, // Will be null for most users initially
                enableCosmicFeatures: false // Default to false
              }}
              cosmicData={null}
            />
          )}
        </TabContainer>

      {/* Journal Entry Modal - Rendered via portal */}
              {showJournalModal && createPortal(
          <div 
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 pt-8" 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
                      <div 
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg max-w-4xl w-full h-[75vh] border border-white/20 dark:border-gray-600/20 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                <JournalEntry 
                  onAddEntry={addEntry} 
                  onOpenImageModal={openImageModal}
                  imageComments={imageComments}
                  onUpdateImageComment={updateImageComment}
                  editingEntry={editingEntry}
                  onClose={closeJournalModalWithSave}
                  onUpdateEntryData={setCurrentEntryData}
                  currentEntryIndex={currentEntryIndex}
                  totalEntries={entries.length}
                  onNavigateNext={navigateToNextEntry}
                  onNavigatePrevious={navigateToPreviousEntry}
                />
              </div>
            </div>
        </div>,
        document.body
      )}

      {/* Image Modal - Rendered via portal */}
      {selectedImage && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-600/20 shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Image Details</h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <img 
                  src={selectedImage.data} 
                  alt="Selected image"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
                <textarea
                  value={imageComments[selectedImage.id] || ''}
                  onChange={(e) => updateImageComment(selectedImage.id, e.target.value)}
                  placeholder="Add a comment about this image..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}


      </div>
    </div>
  )
} 