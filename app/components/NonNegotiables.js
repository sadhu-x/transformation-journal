'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Check, X, Save } from 'lucide-react'
import { addNonNegotiable, updateNonNegotiable, deleteNonNegotiable } from '../../lib/dataService'

export default function NonNegotiables({ items = [], onUpdateItems }) {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [newItemText, setNewItemText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0]
  
  // Filter items for the selected date
  const getItemsForDate = (date) => {
    return items.filter(item => {
      const itemDate = new Date(item.created_at || item.createdAt).toISOString().split('T')[0]
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
    const yesterdayDate = yesterday.toISOString().split('T')[0]
    
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
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{todayCompleted} of {todayTotal} completed today</span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {selectedDate !== getTodayDate() && (
          <button
            onClick={() => setSelectedDate(getTodayDate())}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Today
          </button>
        )}
        {selectedDate === getTodayDate() && (
          <button
            onClick={copyFromYesterday}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Copy from Yesterday
          </button>
        )}
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