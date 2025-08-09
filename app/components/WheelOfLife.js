'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Upload, Link, Edit3, Trash2 } from 'lucide-react'

const LIFE_AREAS = [
  { id: 1, name: 'Health & Vitality', color: 'from-red-400 to-red-600' },
  { id: 2, name: 'Relationships & Love', color: 'from-pink-400 to-pink-600' },
  { id: 3, name: 'Career & Purpose', color: 'from-blue-400 to-blue-600' },
  { id: 4, name: 'Wealth & Abundance', color: 'from-green-400 to-green-600' },
  { id: 5, name: 'Home & Environment', color: 'from-yellow-400 to-yellow-600' },
  { id: 6, name: 'Learning & Growth', color: 'from-indigo-400 to indigo-600' },
  { id: 7, name: 'Creativity & Expression', color: 'from-purple-400 to-purple-600' },
  { id: 8, name: 'Spirituality & Inner Peace', color: 'from-cyan-400 to-cyan-600' },
  { id: 9, name: 'Adventure & Travel', color: 'from-orange-400 to-orange-600' },
  { id: 10, name: 'Community & Service', color: 'from-teal-400 to-teal-600' },
  { id: 11, name: 'Joy & Fun', color: 'from-rose-400 to-rose-600' },
  { id: 12, name: 'Wisdom & Intuition', color: 'from-violet-400 to-violet-600' }
]

export default function WheelOfLife() {
  const [segments, setSegments] = useState({})
  const [editingSegment, setEditingSegment] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(null)
  const [imageInput, setImageInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [imageInputType, setImageInputType] = useState('url') // 'url' or 'file'
  const fileInputRef = useRef(null)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wheelOfLife')
    if (saved) {
      try {
        setSegments(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading wheel data:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever segments change
  useEffect(() => {
    localStorage.setItem('wheelOfLife', JSON.stringify(segments))
  }, [segments])

  const handleSegmentClick = (segmentId) => {
    setCurrentSegment(segmentId)
    setShowImageModal(true)
    setImageInput('')
    setImageInputType('url')
  }

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
        images: [...(prev[currentSegment]?.images || []), newImage].slice(0, 5) // Max 5 images
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

    const getCollageLayout = (count) => {
      switch (count) {
        case 1: return 'single'
        case 2: return 'side-by-side'
        case 3: return 'triangle'
        case 4: return 'grid-2x2'
        case 5: return 'grid-2x3'
        default: return 'grid-2x2'
      }
    }

    const layout = getCollageLayout(images.length)

    return (
      <div className={`image-collage layout-${layout}`}>
        {images.map((image, index) => (
          <div key={image.id} className="image-container">
            <img 
              src={image.src} 
              alt={`Manifestation ${index + 1}`}
              className="segment-image"
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
    <div className="wheel-of-life-container">
      <div className="wheel-header mb-8">
        <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Wheel of Life
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Click on any segment to add your manifestations and visual representations. 
          Upload images or add URLs to create a powerful visual collage of your desired life.
        </p>
      </div>

      {/* Wheel Container */}
      <div className="wheel-wrapper flex justify-center items-center mb-8">
        <div className="wheel relative w-96 h-96">
          {LIFE_AREAS.map((area, index) => {
            const angle = (index * 30) - 15 // Start from -15° to center segments
            const segmentData = segments[area.id] || { text: '', images: [] }
            
            return (
              <div
                key={area.id}
                className={`wheel-segment absolute w-full h-full cursor-pointer transition-all duration-300 hover:scale-105 ${
                  segmentData.images?.length > 0 ? 'has-images' : ''
                }`}
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'center'
                }}
                onClick={() => handleSegmentClick(area.id)}
              >
                <div 
                  className={`segment-content absolute top-0 left-0 w-full h-full bg-gradient-to-br ${area.color} rounded-full transition-all duration-300 ${
                    segmentData.text || (segmentData.images && segmentData.images.length > 0)
                      ? 'opacity-100 shadow-lg'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)',
                    transform: 'rotate(15deg)'
                  }}
                >
                  <div className="segment-inner absolute inset-2 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="text-center text-white font-medium text-xs px-2">
                      <div className="segment-name mb-1">{area.name}</div>
                      {segmentData.text && (
                        <div className="segment-text text-xs opacity-90 truncate mb-1">
                          {segmentData.text}
                        </div>
                      )}
                      {renderImageCollage(segmentData.images, area.id)}
                      <div className="segment-actions mt-1 flex justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTextEdit(area.id)
                          }}
                          className="text-white/80 hover:text-white text-xs p-1 rounded hover:bg-white/20 transition-colors"
                          title="Edit text"
                        >
                          <Edit3 size={10} />
                        </button>
                        {segmentData.images && segmentData.images.length > 0 && (
                          <span className="text-white/80 text-xs bg-black/30 px-1 rounded">
                            {segmentData.images.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-white text-center text-xs font-bold">
              <div>MANIFEST</div>
              <div>YOUR</div>
              <div>LIFE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Add to {LIFE_AREAS.find(a => a.id === currentSegment)?.name}
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
                  imageInputType === 'file'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                Add manifestation text to {LIFE_AREAS.find(a => a.id === currentSegment)?.name}
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
                  Save Text
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
          <strong>How to use:</strong> Click on any segment to add images and manifestations.
        </p>
        <p className="text-sm">
          Each segment can hold up to 5 images. Use this as a daily visualization tool 
          to manifest your desired life in each area.
        </p>
        
        {/* Clear All Button */}
        {Object.keys(segments).length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all your manifestations? This cannot be undone.')) {
                  setSegments({})
                  localStorage.removeItem('wheelOfLife')
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
            >
              Clear All Data
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
