'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getEntries, saveEntry, triggerAIAnalysis, updateEntry as updateEntryToDB, deleteEntry as deleteEntryFromDB, getLocalEntries, saveLocalEntries, getNonNegotiables, addNonNegotiable, updateNonNegotiable, deleteNonNegotiable, saveLocalNonNegotiables } from '../lib/dataService'
import JournalEntry from './components/JournalEntry'
import EntryList from './components/EntryList'
import NonNegotiables from './components/NonNegotiables'
import BookList from './components/BookList'
import WheelOfLife from './components/WheelOfLife'
import AIInsights from './components/AIInsights'
import TabContainer from './components/TabContainer'
import CosmicContextCompact from './components/CosmicContextCompact'
import ExportDropdown from './components/ExportData'
import ThemeToggle from './components/ThemeToggle'
import UserProfile from './components/UserProfile'
import Auth from './components/Auth'
import { X, Plus, Copy, Check } from 'lucide-react'
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
      const hasContent = currentEntryData.content?.trim() || 
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
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get today's date in local timezone
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

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
        
        // Save to database (without AI analysis)
        const savedEntry = await saveEntry(entry)
        
        // Update local state with the saved entry
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

  // Separate function for triggering AI analysis
  const triggerAIAnalysisForEntry = async (entryId, content) => {
    try {
      console.log('🤖 Triggering AI analysis for entry:', entryId)
      const analysisResult = await triggerAIAnalysis(entryId, content)
      
      if (analysisResult.success) {
        // Update local state with AI analysis results
        setEntries(prev => prev.map(e => {
          if (e.id === entryId) {
            return {
              ...e,
              ai_analysis: analysisResult.analysis,
              ai_remedies: analysisResult.remedies,
              ai_prompts: analysisResult.prompts
            }
          }
          return e
        }))
        
        // Update editing entry if it's currently open
        if (editingEntry && editingEntry.id === entryId) {
          setEditingEntry(prev => ({
            ...prev,
            ai_analysis: analysisResult.analysis,
            ai_remedies: analysisResult.remedies,
            ai_prompts: analysisResult.prompts
          }))
        }
        
        console.log('✅ AI analysis completed and state updated')
        return analysisResult
      } else {
        console.error('❌ AI analysis failed:', analysisResult.error)
        return analysisResult
      }
    } catch (error) {
      console.error('❌ Error triggering AI analysis:', error)
      return { success: false, error: error.message }
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

  const openJournalModal = async (entry = null) => {
    console.log('openJournalModal called with entry:', entry) // Debug log
    
    if (entry && entry.id) {
      // Refresh entry data from the latest state to ensure we have AI analysis
      const latestEntry = entries.find(e => e.id === entry.id)
      console.log('Latest entry from state:', latestEntry) // Debug log
      console.log('All entries:', entries) // Debug log
      setEditingEntry(latestEntry || entry)
      
      const index = entries.findIndex(e => e.id === entry.id)
      setCurrentEntryIndex(index)
    } else {
      setEditingEntry(null)
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
      const hasContent = dataToSave.content?.trim() || 
                        (dataToSave.attachments && dataToSave.attachments.length > 0)
      
      if (hasContent) {
        try {
          console.log('Auto-saving entry on close:', dataToSave)
          await addEntry(dataToSave)
          console.log('✅ Entry auto-saved successfully on close')
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

  const copyComprehensivePrompt = async () => {
    const comprehensivePrompt = `## Context
I'm tracking my daily consciousness, emotions, and patterns for personal transformation using a custom journal app with Vedic astrology integration. I'd like you to analyze this data to identify patterns, insights, and recommendations for optimizing my growth, including cosmic influences and traditional Vedic remedies.

## Analysis Goals
Please analyze for:
1. **Peak Performance Patterns**: When am I at my best? What conditions create optimal states?
2. **Discipline vs Surrender Balance**: How do structure and flow interact?
3. **Energy Patterns**: What activities/states give vs. drain energy?
4. **Transformation Indicators**: Signs of growth and areas needing attention
5. **Time-of-Day Insights**: When am I most clear, present, energized?
6. **Emotional Triggers**: What patterns emerge in my emotional states?
7. **Gratitude Impact**: How does gratitude correlate with other states?
8. **Challenge Response**: How do I handle difficulties and what helps?
9. **Cosmic Influences**: How do Vedic astrological factors correlate with my states and experiences?
10. **Lunar Cycle Patterns**: How do moon phases and tithis affect my energy and performance?
11. **Nakshatra Insights**: How do different lunar mansions influence my experiences?
12. **Cognitive Development Patterns**: How do different activities and states affect my mental clarity, problem-solving, and learning?
13. **Physical Strength Patterns**: How do exercise, movement, and physical activities correlate with my overall performance and energy?
14. **Creativity Patterns**: When am I most creative? What conditions foster innovative thinking and artistic expression?
15. **Wealth Building Patterns**: How do my activities, decisions, and states correlate with financial success and wealth creation?

## Vedic Astrology Analysis
Please consider:
- **Natal Chart Analysis**: How do my birth chart placements interact with current transits and cosmic influences?
- **Sun-Moon Relationship**: How do solar and lunar positions interact with my states?
- **Nakshatra Qualities**: Which lunar mansions support vs. challenge my goals?
- **Tithi Activities**: How do lunar days align with my practices and outcomes?
- **Elemental Balance**: How do Fire, Earth, Air, Water elements in cosmic positions affect me?
- **Dosha Analysis**: How do my birth chart doshas influence my current state and recommendations?

## Vedic Remedies & Practices
Please recommend specific practices based on cosmic context:
- **Mudras (Hand Gestures)**: Specific hand positions for balancing elements and energy
- **Acupressure Points**: Key pressure points for emotional and physical balance
- **Pranayama (Breathing)**: Breathing techniques for current cosmic influences
- **Herbs & Spices**: Traditional herbs and spices for balancing doshas and elements
- **Food Recommendations**: Specific foods, meals, and dietary practices aligned with current cosmic influences, doshas, and elemental balance
- **Aromatherapy & Fragrances**: Essential oils, incense, and fragrances for dosha balancing, planetary alignment, and energy purification
- **Gemstones**: Precious and semi-precious stones for planetary and elemental balance
- **Mantras**: Sacred sounds and chants for specific nakshatras and tithis
- **Yoga Asanas**: Postures that align with current cosmic energies
- **Meditation Techniques**: Practices suited to current lunar and solar positions

## Requested Output Format
Please provide analysis in this JSON format:
{
  "analysis": {
    "emotional_state": "Brief description of emotional state and spiritual insights",
    "key_themes": ["theme1", "theme2", "theme3"],
    "patterns": ["pattern1", "pattern2"],
    "insights": "Deep insights covering cognitive, physical, creative, and financial aspects revealed in this entry",
    "growth_areas": ["cognitive area", "physical area", "creative area", "financial area"],
    "strengths": ["cognitive strength", "physical strength", "creative strength", "financial strength"],
    "cosmic_influences": "How current cosmic energies and Vedic principles relate to this entry",
    "dosha_balance": "Insights about Vata, Pitta, Kapha balance reflected in this entry"
  },
  "remedies": [
    {
      "title": "Remedy title",
      "description": "Detailed description with specific instructions",
      "category": "mantras|gemstones|acupressure|meditations|service|mudras|pranayama|herbs|food|aromatherapy|yoga|cognitive|physical|creative|financial|vedic|mindfulness|action|reflection",
      "priority": "high|medium|low",
      "estimated_time": "5-10 minutes|15-30 minutes|1+ hours",
      "domain": "mental|physical|creative|financial|spiritual"
    }
  ],
  "prompts": [
    {
      "id": "prompt_timestamp_random",
      "question": "Deep reflection question covering multiple domains",
      "category": "cognitive|physical|creative|financial|spiritual|integration",
      "difficulty": "easy|medium|challenging",
      "domain": "mental|physical|creative|financial|spiritual|multi-domain"
    }
  ]
}

## Guidelines:
1. **Be compassionate and non-judgmental** - The person is being vulnerable
2. **Focus on holistic transformation** - Address cognitive, physical, creative, and financial growth
3. **Provide actionable insights** - Give specific, practical guidance across all domains
4. **Acknowledge emotions while expanding scope** - Validate feelings and connect to broader potential
5. **Suggest varied remedies** - Mix cognitive exercises, physical practices, creative techniques, financial strategies, and Vedic wisdom
6. **Ask multi-dimensional questions** - Help them integrate insights across life domains
7. **Include traditional wisdom** - Incorporate Vedic principles, dosha balance, and cosmic awareness
8. **Consider elemental balance** - Address Fire (creativity/passion), Earth (stability/wealth), Air (mental clarity), Water (emotional flow)

## Instructions for Use
This prompt is designed for analyzing journal entries in a conversation format. When you receive a journal entry, apply this comprehensive analysis framework to provide deep insights, traditional Vedic remedies, and actionable recommendations across all life domains.`

    try {
      await navigator.clipboard.writeText(comprehensivePrompt)
      setCopiedPrompt(true)
      setToastMessage('Comprehensive prompt copied to clipboard!')
      setTimeout(() => {
        setCopiedPrompt(false)
        setToastMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy prompt:', error)
      setToastMessage('Failed to copy prompt')
      setTimeout(() => setToastMessage(null), 3000)
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
              <button
                onClick={copyComprehensivePrompt}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm font-medium"
                title="Copy comprehensive Claude prompt for conversation use"
              >
                {copiedPrompt ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Prompt
                  </>
                )}
              </button>
              <CosmicContextCompact />
              <ExportDropdown entries={entries} selectedDate={activeTab === 'non-negotiables' ? selectedDate : null} />
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
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
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
          {activeTab === 'wheel-of-life' && (
            <WheelOfLife />
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
                  onTriggerAIAnalysis={triggerAIAnalysisForEntry}
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
                  onUpdateEntry={updateEntry}
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