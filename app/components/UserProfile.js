'use client'

import { useState, useEffect } from 'react'
import { User, Settings, X, Save, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUserProfile, updateUserProfile, generateInstructionTemplate, fetchAndStoreBirthChart } from '../../lib/dataService'

export default function UserProfile({ user, onSignOut }) {
  const [showSettings, setShowSettings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [birthChartStatus, setBirthChartStatus] = useState({
    status: 'idle', // 'idle', 'loading', 'success', 'error', 'cached'
    message: '',
    lastCalculated: null
  })
  const [userConfig, setUserConfig] = useState({
    primaryGoals: '',
    keyPractices: '',
    currentFocus: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    birthLatitude: '',
    birthLongitude: ''
  })

  // Load user configuration from localStorage and Supabase on component mount
  useEffect(() => {
    const loadUserConfig = async () => {
      let config = {
        primaryGoals: '',
        keyPractices: '',
        currentFocus: '',
        birthDate: '',
        birthTime: '',
        birthLocation: '',
        birthLatitude: '',
        birthLongitude: ''
      }

      // First try to load from localStorage
      try {
        const savedConfig = localStorage.getItem('user-config')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          config = { ...config, ...parsedConfig }
          console.log('Loaded config from localStorage:', parsedConfig)
        }
      } catch (error) {
        console.error('Error loading user config from localStorage:', error)
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, clearing old data')
          try {
            localStorage.clear()
          } catch (clearError) {
            console.error('Failed to clear localStorage:', clearError)
          }
        }
      }

      // Then try to load from Supabase user_profiles table (this will override localStorage if available)
      if (user) {
        try {
          const profileData = await getUserProfile()
          if (profileData) {
            const supabaseConfig = {
              primaryGoals: profileData.primary_goals || '',
              keyPractices: profileData.key_practices || '',
              currentFocus: profileData.current_focus || '',
              birthDate: profileData.birth_date || '',
              birthTime: profileData.birth_time || '',
              birthLocation: profileData.birth_location || '',
              birthLatitude: profileData.birth_latitude || '',
              birthLongitude: profileData.birth_longitude || ''
            }
            config = { ...config, ...supabaseConfig }
            console.log('Loaded config from Supabase user_profiles:', supabaseConfig)
          }
        } catch (error) {
          console.error('Error loading user config from Supabase:', error)
        }
      }

      setUserConfig(config)
    }

    loadUserConfig()
  }, [user])

  // Check for existing birth chart data when birth data is loaded
  useEffect(() => {
    const checkBirthChartData = async () => {
      if (user && userConfig.birthDate && userConfig.birthTime && userConfig.birthLatitude && userConfig.birthLongitude) {
        try {
          const { getBirthChartData } = await import('../../lib/dataService')
          const existingData = await getBirthChartData(
            userConfig.birthDate,
            userConfig.birthTime,
            userConfig.birthLatitude,
            userConfig.birthLongitude
          )
          
          if (existingData) {
            setBirthChartStatus({
              status: 'cached',
              message: 'Natal chart data available',
              lastCalculated: existingData.calculated_at
            })
          }
        } catch (error) {
          console.error('Error checking birth chart data:', error)
        }
      }
    }

    checkBirthChartData()
  }, [user, userConfig.birthDate, userConfig.birthTime, userConfig.birthLatitude, userConfig.birthLongitude])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      onSignOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      try {
        console.log('Saving user config to localStorage:', userConfig)
        localStorage.setItem('user-config', JSON.stringify(userConfig))
        console.log('Successfully saved to localStorage')
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError)
        if (localStorageError.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, clearing old data')
          try {
            localStorage.clear()
            localStorage.setItem('user-config', JSON.stringify(userConfig))
          } catch (retryError) {
            console.error('Failed to save after clearing localStorage:', retryError)
          }
        }
      }
      
      // Also save to Supabase user_profiles table if available
      if (user) {
        try {
          const profileData = {
            primary_goals: userConfig.primaryGoals,
            key_practices: userConfig.keyPractices,
            current_focus: userConfig.currentFocus,
            birth_date: userConfig.birthDate || null,
            birth_time: userConfig.birthTime || null,
            birth_location: userConfig.birthLocation,
            birth_latitude: userConfig.birthLatitude ? parseFloat(userConfig.birthLatitude) : null,
            birth_longitude: userConfig.birthLongitude ? parseFloat(userConfig.birthLongitude) : null
          }
          
          await updateUserProfile(profileData)
          console.log('Successfully saved to Supabase user_profiles')
        } catch (error) {
          console.warn('Could not save to Supabase user_profiles:', error)
          // Provide more specific error message based on error type
          if (error.code === '23505') {
            console.warn('Profile already exists, this is normal for existing users')
          } else {
            console.warn('Database error:', error.message)
          }
        }
      }
      
      setShowSettings(false)
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setUserConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGeocodeLocation = async () => {
    if (!userConfig.birthLocation) {
      alert('Please enter a birth location first')
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userConfig.birthLocation)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const location = data[0]
        setUserConfig(prev => ({
          ...prev,
          birthLatitude: location.lat,
          birthLongitude: location.lon
        }))
      } else {
        alert('Location not found. Please try a more specific location.')
      }
    } catch (error) {
      console.error('Error geocoding location:', error)
      alert('Error finding coordinates. Please enter them manually.')
    }
  }

  const generateAIPrompt = async () => {
    try {
      const prompt = await generateInstructionTemplate(userConfig)
      
      // Create a downloadable file
      const blob = new Blob([prompt], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transformation-journal-ai-prompt.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('AI prompt with natal chart data has been downloaded!')
    } catch (error) {
      console.error('Error generating AI prompt:', error)
      alert('Error generating AI prompt. Please try again.')
    }
  }

  const handleFetchBirthChart = async () => {
    if (!userConfig.birthDate || !userConfig.birthTime || !userConfig.birthLatitude || !userConfig.birthLongitude) {
      alert('Please fill in all birth data fields before fetching your natal chart.')
      return
    }

    setBirthChartStatus({
      status: 'loading',
      message: 'Calculating your natal chart...',
      lastCalculated: null
    })

    try {
      const result = await fetchAndStoreBirthChart(
        userConfig.birthDate,
        userConfig.birthTime,
        userConfig.birthLatitude,
        userConfig.birthLongitude
      )

      if (result.success) {
        const status = result.cached ? 'cached' : 'success'
        const message = result.cached 
          ? 'Natal chart data retrieved from database'
          : 'Natal chart calculated and stored successfully'
        
        setBirthChartStatus({
          status,
          message,
          lastCalculated: result.data.calculated_at
        })
      } else {
        setBirthChartStatus({
          status: 'error',
          message: result.error || 'Failed to calculate natal chart',
          lastCalculated: null
        })
      }
    } catch (error) {
      console.error('Error fetching birth chart:', error)
      setBirthChartStatus({
        status: 'error',
        message: 'Error calculating natal chart. Please try again.',
        lastCalculated: null
      })
    }
  }



  return (
    <>
      <div className="relative">
        <button
          onClick={() => {
            console.log('Opening settings modal, current userConfig:', userConfig)
            setShowSettings(true)
          }}
          className="flex items-center p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Profile Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
              <button
                onClick={() => setActiveTab(0)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 0
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Goals & Practices
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 1
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Birth Data
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {/* Tab 0: Goals & Practices */}
              {activeTab === 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Goals
                    </label>
                    <textarea
                      value={userConfig.primaryGoals}
                      onChange={(e) => handleInputChange('primaryGoals', e.target.value)}
                      placeholder="e.g., Living my best life, optimizing trading performance, spiritual growth"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Practices
                    </label>
                    <textarea
                      value={userConfig.keyPractices}
                      onChange={(e) => handleInputChange('keyPractices', e.target.value)}
                      placeholder="e.g., Daily meditation, breathwork, qigong, trading, FileMaker development"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Focus
                    </label>
                    <textarea
                      value={userConfig.currentFocus}
                      onChange={(e) => handleInputChange('currentFocus', e.target.value)}
                      placeholder="e.g., Building system adherence in trading, deepening spiritual practices"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows="2"
                    />
                  </div>
                </>
              )}

              {/* Tab 1: Birth Data */}
              {activeTab === 1 && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Birth Data
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={userConfig.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Birth Time
                      </label>
                      <input
                        type="time"
                        value={userConfig.birthTime}
                        onChange={(e) => handleInputChange('birthTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Birth Location
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userConfig.birthLocation}
                        onChange={(e) => handleInputChange('birthLocation', e.target.value)}
                        placeholder="e.g., New York, NY, USA"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleGeocodeLocation}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                        title="Find coordinates for this location"
                      >
                        <MapPin className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={userConfig.birthLatitude}
                        onChange={(e) => handleInputChange('birthLatitude', e.target.value)}
                        placeholder="e.g., 40.7128"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={userConfig.birthLongitude}
                        onChange={(e) => handleInputChange('birthLongitude', e.target.value)}
                        placeholder="e.g., -74.0060"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Birth Chart Status Indicator */}
                  <div className="mt-4 p-3 rounded-md border">
                    {birthChartStatus.status === 'idle' && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Your natal chart data will be calculated and stored for future use.
                        </p>
                        <button
                          type="button"
                          onClick={handleFetchBirthChart}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Calculate Natal Chart
                        </button>
                      </div>
                    )}
                    
                    {birthChartStatus.status === 'loading' && (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {birthChartStatus.message}
                        </p>
                      </div>
                    )}
                    
                    {birthChartStatus.status === 'success' && (
                      <div className="text-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {birthChartStatus.message}
                        </p>
                        {birthChartStatus.lastCalculated && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Calculated: {new Date(birthChartStatus.lastCalculated).toLocaleString()}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleFetchBirthChart}
                          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Recalculate
                        </button>
                      </div>
                    )}
                    
                    {birthChartStatus.status === 'cached' && (
                      <div className="text-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {birthChartStatus.message}
                        </p>
                        {birthChartStatus.lastCalculated && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Last calculated: {new Date(birthChartStatus.lastCalculated).toLocaleString()}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleFetchBirthChart}
                          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Recalculate
                        </button>
                      </div>
                    )}
                    
                    {birthChartStatus.status === 'error' && (
                      <div className="text-center">
                        <div className="w-6 h-6 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {birthChartStatus.message}
                        </p>
                        <button
                          type="button"
                          onClick={handleFetchBirthChart}
                          className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> Birth data is used to calculate your natal chart and provide personalized Vedic astrology insights, including dosha analysis, planetary influences, and cosmic timing recommendations.
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      <strong>AI Integration:</strong> Generate a personalized AI prompt with your natal chart data for enhanced Vedic astrology analysis.
                    </p>
                    <button
                      type="button"
                      onClick={generateAIPrompt}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Generate AI Prompt with Natal Chart
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 