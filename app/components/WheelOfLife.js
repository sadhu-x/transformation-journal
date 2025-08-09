'use client'

import { useState, useEffect } from 'react'
import { Edit3, X, Trash2, Target, Heart, DollarSign, Home, BookOpen, Palette, Sparkles, Plane, Users, PartyPopper, Brain, Activity } from 'lucide-react'

const LIFE_AREAS = [
  { id: 1, name: 'Health & Vitality', color: 'from-red-400 to-red-600', icon: Activity },
  { id: 2, name: 'Relationships & Love', color: 'from-pink-400 to-pink-600', icon: Heart },
  { id: 3, name: 'Career & Purpose', color: 'from-blue-400 to-blue-600', icon: Target },
  { id: 4, name: 'Wealth & Abundance', color: 'from-green-400 to-green-600', icon: DollarSign },
  { id: 5, name: 'Home & Environment', color: 'from-yellow-400 to-yellow-600', icon: Home },
  { id: 6, name: 'Learning & Growth', color: 'from-indigo-400 to-indigo-600', icon: BookOpen },
  { id: 7, name: 'Creativity & Expression', color: 'from-purple-400 to-purple-600', icon: Palette },
  { id: 8, name: 'Spirituality & Inner Peace', color: 'from-cyan-400 to-cyan-600', icon: Sparkles },
  { id: 9, name: 'Adventure & Travel', color: 'from-orange-400 to-orange-600', icon: Plane },
  { id: 10, name: 'Community & Service', color: 'from-teal-400 to-teal-600', icon: Users },
  { id: 11, name: 'Joy & Fun', color: 'from-rose-400 to-rose-600', icon: PartyPopper },
  { id: 12, name: 'Wisdom & Intuition', color: 'from-violet-400 to-violet-600', icon: Brain }
]

export default function WheelOfLife() {
  const [segments, setSegments] = useState({})
  const [showTextModal, setShowTextModal] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(null)
  const [textInput, setTextInput] = useState('')

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wheelOfLife')
    if (saved) {
      try {
        setSegments(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading goals data:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever segments change
  useEffect(() => {
    localStorage.setItem('wheelOfLife', JSON.stringify(segments))
  }, [segments])

  const handleTextEdit = (segmentId) => {
    setCurrentSegment(segmentId)
    setTextInput(segments[segmentId]?.text || '')
    setShowTextModal(true)
  }

  const saveText = () => {
    if (textInput.trim()) {
      setSegments(prev => ({
        ...prev,
        [currentSegment]: {
          ...prev[currentSegment],
          text: textInput.trim()
        }
      }))
    }
    setShowTextModal(false)
    setTextInput('')
  }

  const clearIndividualGoal = (segmentId) => {
    if (confirm('Are you sure you want to clear this goal?')) {
      setSegments(prev => {
        const newSegments = { ...prev }
        if (newSegments[segmentId]) {
          delete newSegments[segmentId]
        }
        return newSegments
      })
    }
  }

  return (
    <div className="goals-container">
      <div className="goals-header mb-8">
        <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Life Goals & Manifestations
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Set your intentions and manifest your desired life in each area. 
          Write clear, specific goals to bring your vision to life.
        </p>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {LIFE_AREAS.map((area) => {
          const segmentData = segments[area.id] || { text: '' }
          
          return (
            <div
              key={area.id}
              className={`goal-card bg-gradient-to-br ${area.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center gap-3 mb-4">
                <area.icon size={24} className="text-white" />
                <h3 className="text-lg font-semibold">{area.name}</h3>
              </div>
              
              {segmentData.text && (
                <div className="text-sm mb-4 p-3 bg-white/20 rounded-lg">
                  {segmentData.text}
                </div>
              )}
              
                            <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleTextEdit(area.id)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                  title={segmentData.text ? 'Edit Goal' : 'Add Goal'}
                >
                  <Edit3 size={16} />
                </button>
                {segmentData.text && (
                  <button
                    onClick={() => clearIndividualGoal(area.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={14} className="inline mr-2" />
                    Clear Goal
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Text Input Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Set your goal for {LIFE_AREAS.find(a => a.id === currentSegment)?.name}
              </h3>
              <button
                onClick={() => setShowTextModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                placeholder="What do you want to manifest in this area of your life?"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveText}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Save Goal
                </button>
                <button
                  onClick={() => setShowTextModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        <p className="mb-2">
          <strong>How to use:</strong> Click "Add Goal" to set your intention for each life area.
        </p>
        <p className="text-sm">
          Write clear, specific goals that inspire you. Use this as a daily reminder 
          to focus on what matters most in each area of your life.
        </p>
        
        {/* Clear All Button */}
        {Object.keys(segments).length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all your goals? This cannot be undone.')) {
                  setSegments({})
                  localStorage.removeItem('wheelOfLife')
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
            >
              Clear All Goals
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
