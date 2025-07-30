'use client'

import { useState, useEffect } from 'react'
import { User, Settings, X, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function UserProfile({ user, onSignOut }) {
  const [showSettings, setShowSettings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userConfig, setUserConfig] = useState({
    primaryGoals: '',
    keyPractices: '',
    currentFocus: ''
  })

  // Load user configuration from localStorage and Supabase on component mount
  useEffect(() => {
    const loadUserConfig = async () => {
      let config = {
        primaryGoals: '',
        keyPractices: '',
        currentFocus: ''
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

      // Then try to load from Supabase user metadata (this will override localStorage if available)
      if (user) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser?.user_metadata?.userConfig) {
            const supabaseConfig = currentUser.user_metadata.userConfig
            config = { ...config, ...supabaseConfig }
            console.log('Loaded config from Supabase:', supabaseConfig)
          }
        } catch (error) {
          console.error('Error loading user config from Supabase:', error)
        }
      }

      setUserConfig(config)
    }

    loadUserConfig()
  }, [user])

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
      
      // Also save to Supabase user metadata if available
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { userConfig }
        })
        if (error) console.warn('Could not save to Supabase:', error)
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

            <div className="space-y-4">
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