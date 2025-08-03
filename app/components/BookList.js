import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, CheckCircle, Clock, Target, TrendingUp, Heart, Brain, DollarSign, Zap } from 'lucide-react'
import { getPersonalizedRecommendations, getPersonalizedReadingSchedule, getCategoryBalanceRecommendations, getCosmicReadingRecommendations } from '../../lib/bookDatabase'

export default function BookList({ userProfile, cosmicData }) {
  const [books, setBooks] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: 'business_financial',
    priority: 'medium',
    status: 'to_read',
    notes: ''
  })

  // Universal book categories
  const categories = {
    business_financial: {
      name: 'Business & Financial',
      icon: DollarSign,
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    spiritual_development: {
      name: 'Spiritual Development',
      icon: Heart,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    },
    personal_development: {
      name: 'Personal Development',
      icon: Brain,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    },
    diverse_learning: {
      name: 'Diverse Learning',
      icon: BookOpen,
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    }
  }

  useEffect(() => {
    try {
      // Load user's existing books from localStorage or database
      const savedBooks = localStorage.getItem('userBooks')
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks))
      } else {
        // Initialize with personalized recommendations based on user's goals
        // Handle case where userProfile might be null or not have expected properties
        const safeUserProfile = userProfile || {}
        const initialBooks = getPersonalizedRecommendations(safeUserProfile)
        setBooks(initialBooks)
        localStorage.setItem('userBooks', JSON.stringify(initialBooks))
      }
    } catch (error) {
      console.error('Error initializing BookList:', error)
      // Fallback to empty array if there's an error
      setBooks([])
    }
  }, [userProfile])

  const getReadingSchedule = () => {
    try {
      const safeUserProfile = userProfile || {}
      return getPersonalizedReadingSchedule(safeUserProfile)
    } catch (error) {
      console.error('Error getting reading schedule:', error)
      return null
    }
  }

  const getCategoryBalance = () => {
    try {
      const safeUserProfile = userProfile || {}
      return getCategoryBalanceRecommendations(safeUserProfile, books)
    } catch (error) {
      console.error('Error getting category balance:', error)
      return []
    }
  }

  const getCosmicRecommendations = () => {
    try {
      const safeUserProfile = userProfile || {}
      return getCosmicReadingRecommendations(safeUserProfile, cosmicData)
    } catch (error) {
      console.error('Error getting cosmic recommendations:', error)
      return null
    }
  }

  const addBook = () => {
    if (newBook.title && newBook.author) {
      const book = {
        ...newBook,
        id: Date.now(),
        addedAt: new Date().toISOString()
      }
      const updatedBooks = [...books, book]
      setBooks(updatedBooks)
      localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
      setNewBook({
        title: '',
        author: '',
        category: 'business_financial',
        priority: 'medium',
        status: 'to_read',
        notes: ''
      })
      setShowAddForm(false)
    }
  }

  const updateBookStatus = (bookId, newStatus) => {
    const updatedBooks = books.map(book => 
      book.id === bookId ? { ...book, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null } : book
    )
    setBooks(updatedBooks)
    localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'reading': return <BookOpen className="w-4 h-4 text-blue-600" />
      case 'to_read': return <Clock className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const completedBooks = books.filter(book => book.status === 'completed')
  const readingBooks = books.filter(book => book.status === 'reading')
  const toReadBooks = books.filter(book => book.status === 'to_read')

  const readingSchedule = getReadingSchedule()
  const categoryRecommendations = getCategoryBalance()
  const cosmicRecommendations = getCosmicRecommendations()

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading List</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Goal</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {userProfile?.readingGoal || 50}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {completedBooks.length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Reading</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {readingBooks.length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">To Read</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {toReadBooks.length}
            </p>
          </div>
        </div>

        {/* Personalized Reading Schedule */}
        {readingSchedule && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Your Personalized Reading Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(readingSchedule).map(([time, suggestion]) => (
                <div key={time} className="bg-white dark:bg-gray-800 rounded p-3">
                  <div className="font-medium text-purple-900 dark:text-purple-100 capitalize">
                    {time}
                  </div>
                  <div className="text-purple-700 dark:text-purple-300">
                    {suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Balance Recommendations */}
        {categoryRecommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Reading Balance Suggestions
            </h3>
            <ul className="space-y-1">
              {categoryRecommendations.map((recommendation, index) => (
                <li key={index} className="text-blue-700 dark:text-blue-300 text-sm">
                  • {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cosmic Reading Recommendations */}
        {cosmicRecommendations && cosmicRecommendations.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              Cosmic Reading Insights
            </h3>
            <ul className="space-y-1">
              {cosmicRecommendations.map((recommendation, index) => (
                <li key={index} className="text-indigo-700 dark:text-indigo-300 text-sm">
                  • {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Book Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Book Title"
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({...newBook, author: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <select
              value={newBook.category}
              onChange={(e) => setNewBook({...newBook, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
            <select
              value={newBook.priority}
              onChange={(e) => setNewBook({...newBook, priority: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="essential">Essential</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={newBook.notes}
            onChange={(e) => setNewBook({...newBook, notes: e.target.value})}
            className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows="3"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={addBook}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Book
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Book Lists */}
      <div className="space-y-6">
        {/* Currently Reading */}
        {readingBooks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Currently Reading ({readingBooks.length})
            </h3>
            <div className="space-y-3">
              {readingBooks.map(book => (
                <BookItem key={book.id} book={book} categories={categories} onStatusChange={updateBookStatus} />
              ))}
            </div>
          </div>
        )}

        {/* To Read */}
        {toReadBooks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              To Read ({toReadBooks.length})
            </h3>
            <div className="space-y-3">
              {toReadBooks.map(book => (
                <BookItem key={book.id} book={book} categories={categories} onStatusChange={updateBookStatus} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedBooks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Completed ({completedBooks.length})
            </h3>
            <div className="space-y-3">
              {completedBooks.map(book => (
                <BookItem key={book.id} book={book} categories={categories} onStatusChange={updateBookStatus} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BookItem({ book, categories, onStatusChange }) {
  const CategoryIcon = categories[book.category]?.icon || BookOpen

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {getStatusIcon(book.status)}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{book.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author}</p>
          </div>
        </div>
        {book.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{book.notes}</p>
        )}
        <div className="flex gap-2 mt-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categories[book.category]?.color}`}>
            <CategoryIcon className="w-3 h-3" />
            {categories[book.category]?.name}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(book.priority)}`}>
            {book.priority.charAt(0).toUpperCase() + book.priority.slice(1)}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        {book.status === 'to_read' && (
          <button
            onClick={() => onStatusChange(book.id, 'reading')}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Start Reading
          </button>
        )}
        {book.status === 'reading' && (
          <button
            onClick={() => onStatusChange(book.id, 'completed')}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            Mark Complete
          </button>
        )}
        <select
          value={book.status}
          onChange={(e) => onStatusChange(book.id, e.target.value)}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
        >
          <option value="to_read">To Read</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  )
} 