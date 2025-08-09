'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Upload, Link, Edit3, Trash2, Target, Star, Heart, DollarSign, Home, BookOpen, Palette, Sparkles, Plane, Users, PartyPopper, Brain, Activity, Zap } from 'lucide-react'

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
  const [showImageModal, setShowImageModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(null)
  const [imageInput, setImageInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [imageInputType, setImageInputType] = useState('url')
  const fileInputRef = useRef(null)

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

  const addImage = () => {
    if (!imageInput.trim() && imageInputType === 'url') return
    
    const newImage = {
      id: Date.now(),
      type: imageInputType,
      src: imageInputType === 'url' ? imageInput : imageInput,
      timestamp: new Date().toISOString()
    }

    setSegments(prev => ({
      ...prev,
      [currentSegment]: {
        ...prev[currentSegment],
        images: [...(prev[currentSegment]?.images || []), newImage].slice(0, 5)
      }
    }))

    setImageInput('')
    setShowImageModal(false)
  }

  const removeImage = (segmentId, imageId) => {
    setSegments(prev => ({
      ...prev,
      [segmentId]: {
        ...prev[segmentId],
        images: prev[segmentId]?.images?.filter(img => img.id !== imageId) || []
      }
    }))
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          type: 'file',
          src: e.target.result,
          timestamp: new Date().toISOString()
        }

        setSegments(prev => ({
          ...prev,
          [currentSegment]: {
            ...prev[currentSegment],
            images: [...(prev[currentSegment]?.images || []), newImage].slice(0, 5)
          }
        }))

        setShowImageModal(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const renderImageCollage = (images, segmentId) => {
    if (!images || images.length === 0) return null

    return (
      <div className="image-collage">
        {images.map((image, index) => (
          <div key={image.id} className="image-container">
            <img 
              src={image.src} 
              alt={`Goal ${index + 1}`}
              className="goal-image"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeImage(segmentId, image.id)
              }}
              className="remove-image-btn"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="goals-container">
      <div className="goals-header mb-8">
        <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Life Goals & Manifestations
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Set your intentions and visualize your desired life in each area. 
          Add images and affirmations to manifest your goals.
        </p>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {LIFE_AREAS.map((area) => {
          const segmentData = segments[area.id] || { text: '', images: [] }
          
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
              
              {renderImageCollage(segmentData.images, area.id)}
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleTextEdit(area.id)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit3 size={14} className="inline mr-2" />
                  {segmentData.text ? 'Edit Goal' : 'Add Goal'}
                </button>
                <button
                  onClick={() => {
                    setCurrentSegment(area.id)
                    setShowImageModal(true)
                    setImageInput('')
                    setImageInputType('url')
                  }}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                >
                  <Plus size={14} className="inline mr-2" />
                  Images
                </button>
              </div>
              
              {segmentData.images && segmentData.images.length > 0 && (
                <div className="mt-3 text-center">
                  <span className="text-xs bg-white/30 px-2 py-1 rounded-full">
                    {segmentData.images.length}/5 images
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Add images to {LIFE_AREAS.find(a => a.id === currentSegment)?.name}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Input Type Toggle */}
            <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setImageInputType('url')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  imageInputType === 'url'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Link size={16} className="inline mr-2" />
                URL
              </button>
              <button
                onClick={() => setImageInputType('file')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  imageInputType === 'url'
                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                }`}
              >
                <Upload size={16} className="inline mr-2" />
                Upload
              </button>
            </div>

            {/* Input Fields */}
            {imageInputType === 'url' ? (
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Enter image URL..."
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addImage}
                  disabled={!imageInput.trim()}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                >
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  <div className="text-gray-600 dark:text-gray-400">
                    Click to upload image
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    JPG, PNG, WebP up to 5MB
                  </div>
                </button>
              </div>
            )}

            {/* Current Images Preview */}
            {segments[currentSegment]?.images?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Images ({segments[currentSegment].images.length}/5)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {segments[currentSegment].images.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeImage(currentSegment, image.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          <strong>How to use:</strong> Click "Add Goal" to set your intention, or "Images" to add visual representations.
        </p>
        <p className="text-sm">
          Each life area can hold up to 5 images. Use this as a daily visualization tool 
          to manifest your desired life in each area.
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
