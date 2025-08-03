'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Check, X, Save } from 'lucide-react'
import { addNonNegotiable, updateNonNegotiable, deleteNonNegotiable } from '../../lib/dataService'
import DatePicker from './DatePicker'

export default function NonNegotiables({ items = [], onUpdateItems }) {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [newItemText, setNewItemText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get today's date in local timezone
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  // Get today's date in YYYY-MM-DD format in local timezone
  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Filter items for the selected date
  const getItemsForDate = (date) => {
    return items.filter(item => {
      // Use the date field if available, otherwise fall back to created_at
      const itemDate = item.date || new Date(item.created_at || item.createdAt).toISOString().split('T')[0]
      return itemDate === date
    })
  }

  // Get current day's items
  const todayItems = getItemsForDate(selectedDate)
  const todayCompleted = todayItems.filter(item => item.completed).length
  const todayTotal = todayItems.length



  const addItem = async () => {
    if (newItemText.trim()) {
      const newItem = {
        text: newItemText.trim(),
        completed: false,
        created_at: new Date().toISOString(),
        completed_at: null,
        date: selectedDate // Add the selected date
      }
      
      try {
        // Add to database first
        const savedItem = await addNonNegotiable(newItem)
        onUpdateItems(prev => [savedItem, ...prev])
        setNewItemText('')
        setShowAddForm(false)
      } catch (error) {
        console.error('Failed to add non-negotiable:', error)
        // Fallback to local state
        const fallbackItem = {
          ...newItem,
          id: Date.now()
        }
        onUpdateItems(prev => [fallbackItem, ...prev])
        setNewItemText('')
        setShowAddForm(false)
      }
    }
  }

  const toggleItem = async (id) => {
    const item = items.find(item => item.id === id)
    if (!item) return

    const updates = {
      completed: !item.completed,
      completed_at: !item.completed ? new Date().toISOString() : null
    }

    try {
      // Update in database first
      await updateNonNegotiable(id, updates)
      onUpdateItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ))
    } catch (error) {
      console.error('Failed to update non-negotiable:', error)
      // Fallback to local state
      onUpdateItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ))
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditText(item.text)
  }

  const saveEdit = async () => {
    if (editText.trim()) {
      try {
        // Update in database first
        await updateNonNegotiable(editingId, { text: editText.trim() })
        onUpdateItems(prev => prev.map(item => 
          item.id === editingId 
            ? { ...item, text: editText.trim() }
            : item
        ))
        setEditingId(null)
        setEditText('')
      } catch (error) {
        console.error('Failed to update non-negotiable:', error)
        // Fallback to local state
        onUpdateItems(prev => prev.map(item => 
          item.id === editingId 
            ? { ...item, text: editText.trim() }
            : item
        ))
        setEditingId(null)
        setEditText('')
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const deleteItem = async (id) => {
    try {
      // Delete from database first
      await deleteNonNegotiable(id)
      onUpdateItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Failed to delete non-negotiable:', error)
      // Fallback to local state
      onUpdateItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const copyFromYesterday = async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const year = yesterday.getFullYear()
    const month = String(yesterday.getMonth() + 1).padStart(2, '0')
    const day = String(yesterday.getDate()).padStart(2, '0')
    const yesterdayDate = `${year}-${month}-${day}`
    
    const yesterdayItems = getItemsForDate(yesterdayDate)
    
    if (yesterdayItems.length === 0) {
      alert('No non-negotiables found for yesterday')
      return
    }

    try {
      // Copy each item from yesterday to today
      const copyPromises = yesterdayItems.map(async (item) => {
        const newItem = {
          text: item.text,
          completed: false, // Reset completion status
          created_at: new Date().toISOString(),
          completed_at: null,
          date: getTodayDate()
        }
        
        const savedItem = await addNonNegotiable(newItem)
        return savedItem
      })

      const copiedItems = await Promise.all(copyPromises)
      onUpdateItems(prev => [...copiedItems, ...prev])
      
      alert(`Copied ${copiedItems.length} non-negotiables from yesterday`)
    } catch (error) {
      console.error('Failed to copy from yesterday:', error)
      alert('Failed to copy non-negotiables from yesterday')
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold dark:text-white">Non-Negotiables</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Daily commitments & habits
          </span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {todayCompleted} of {todayTotal} completed
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            {selectedDate !== getTodayDate() && (
              <button
                onClick={() => setSelectedDate(getTodayDate())}
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Today
              </button>
            )}
            {selectedDate === getTodayDate() && (
              <button
                onClick={copyFromYesterday}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Copy from Yesterday
              </button>
            )}
          </div>
        </div>
        
        {/* Date Display */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDate === getTodayDate() ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Today
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </span>
            {selectedDate !== getTodayDate() && (
              <button
                onClick={() => setSelectedDate(getTodayDate())}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Back to Today
              </button>
            )}
          </div>
          
          {/* Quick Navigation */}
          <div className="mt-2 flex gap-1">
            <button
              onClick={() => {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                const year = yesterday.getFullYear()
                const month = String(yesterday.getMonth() + 1).padStart(2, '0')
                const day = String(yesterday.getDate()).padStart(2, '0')
                setSelectedDate(`${year}-${month}-${day}`)
              }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedDate === (() => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  const year = yesterday.getFullYear()
                  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
                  const day = String(yesterday.getDate()).padStart(2, '0')
                  return `${year}-${month}-${day}`
                })()
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setSelectedDate(getTodayDate())}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedDate === getTodayDate()
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                const year = tomorrow.getFullYear()
                const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
                const day = String(tomorrow.getDate()).padStart(2, '0')
                setSelectedDate(`${year}-${month}-${day}`)
              }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedDate === (() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  const year = tomorrow.getFullYear()
                  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
                  const day = String(tomorrow.getDate()).padStart(2, '0')
                  return `${year}-${month}-${day}`
                })()
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tomorrow
            </button>
          </div>
        </div>
      </div>

      {/* Add New Item */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Non-Negotiable
        </button>
      ) : (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Enter your non-negotiable..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              autoFocus
            />
            <button
              onClick={addItem}
              disabled={!newItemText.trim()}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewItemText('')
              }}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {todayItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No non-negotiables for {selectedDate === getTodayDate() ? 'today' : selectedDate}. Add your first one above!</p>
          </div>
        ) : (
          todayItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                item.completed
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400'
                  }`}
                >
                  {item.completed && <Check size={12} />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p
                        className={`text-sm ${
                          item.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {item.text}
                      </p>
                                             <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                         <span>Created: {formatDate(item.created_at || item.createdAt)}</span>
                         {item.completed && (
                           <span>Completed: {formatDate(item.completed_at || item.completedAt)}</span>
                         )}
                       </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {editingId !== item.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 