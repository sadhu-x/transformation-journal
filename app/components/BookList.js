import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, CheckCircle, Clock, Target, TrendingUp, Heart, Brain, DollarSign, Zap, Lightbulb } from 'lucide-react'
import { getPersonalizedRecommendations, getPersonalizedReadingSchedule, getCategoryBalanceRecommendations, getCosmicReadingRecommendations } from '../../lib/bookDatabase'

export default function BookList({ userProfile, cosmicData }) {
  const [books, setBooks] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [readingSchedule, setReadingSchedule] = useState(null)
  const [categoryBalance, setCategoryBalance] = useState([])
  const [cosmicRecommendations, setCosmicRecommendations] = useState(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
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

  // Load recommendations safely
  useEffect(() => {
    try {
      const safeUserProfile = userProfile || {}
      
      // Get personalized recommendations
      const recs = getPersonalizedRecommendations(safeUserProfile)
      setRecommendations(recs || [])
      
      // Get reading schedule
      const schedule = getPersonalizedReadingSchedule(safeUserProfile)
      setReadingSchedule(schedule)
      
      // Get category balance recommendations
      const balance = getCategoryBalanceRecommendations(safeUserProfile, books)
      setCategoryBalance(balance || [])
      
      // Get cosmic recommendations
      const cosmic = getCosmicReadingRecommendations(safeUserProfile, cosmicData)
      setCosmicRecommendations(cosmic)
      
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }, [userProfile, cosmicData, books])

  console.log('BookList rendering - with recommendations')

  const handleAddBook = () => {
    if (newBook.title && newBook.author) {
      const book = {
        ...newBook,
        id: Date.now(),
        addedAt: new Date().toISOString()
      }
      setBooks(prev => [...prev, book])
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
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, status: newStatus } : book
    ))
  }

  const handleDeleteBook = (bookId) => {
    setBooks(prev => prev.filter(book => book.id !== bookId))
  }

  const completedBooks = books.filter(book => book.status === 'completed')
  const readingBooks = books.filter(book => book.status === 'reading')
  const toReadBooks = books.filter(book => book.status === 'to_read')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading List</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Book
          </button>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {completedBooks.length}
            </p>
            <p className="text-sm text-green-600">Completed</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {readingBooks.length}
            </p>
            <p className="text-sm text-blue-600">Reading</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {toReadBooks.length}
            </p>
            <p className="text-sm text-orange-600">To Read</p>
          </div>
        </div>

        {/* Recommendations Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            {showRecommendations ? 'Hide' : 'Show'} Recommendations
          </button>
        </div>
      </div>

      {/* Recommendations Section */}
      {showRecommendations && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Personalized Recommendations
          </h3>

          {/* Book Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Recommended Books</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.slice(0, 6).map((book, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categories[book.category]?.color}`}>
                        {categories[book.category]?.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {book.priority} priority
                      </span>
                    </div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{book.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author}</p>
                    {book.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{book.notes}</p>
                    )}
                    <button
                      onClick={() => {
                        setNewBook({
                          title: book.title,
                          author: book.author,
                          category: book.category,
                          priority: book.priority,
                          status: 'to_read',
                          notes: book.notes || ''
                        })
                        setShowAddForm(true)
                        setShowRecommendations(false)
                      }}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Add to List
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reading Schedule */}
          {readingSchedule && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Your Reading Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(readingSchedule).map(([time, suggestion]) => (
                  <div key={time} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <div className="font-medium text-purple-900 dark:text-purple-100 capitalize mb-1">
                      {time}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      {suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Balance */}
          {categoryBalance.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Reading Balance Suggestions</h4>
              <ul className="space-y-2">
                {categoryBalance.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cosmic Recommendations */}
          {cosmicRecommendations && cosmicRecommendations.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Cosmic Reading Insights</h4>
              <ul className="space-y-2">
                {cosmicRecommendations.map((insight, index) => (
                  <li key={index} className="text-sm text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.length === 0 && !readingSchedule && categoryBalance.length === 0 && !cosmicRecommendations && (
            <p className="text-gray-600 dark:text-gray-300 text-center py-4">
              No recommendations available. Add some books to get personalized suggestions!
            </p>
          )}
        </div>
      )}

      {/* Add Book Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Book</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Book Title"
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({...newBook, author: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newBook.category}
                onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="business_financial">Business & Financial</option>
                <option value="spiritual_development">Spiritual Development</option>
                <option value="personal_development">Personal Development</option>
                <option value="diverse_learning">Diverse Learning</option>
              </select>
              <select
                value={newBook.priority}
                onChange={(e) => setNewBook({...newBook, priority: e.target.value})}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
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
              rows="3"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddBook}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Book
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Lists */}
      <div className="space-y-6">
        {/* Currently Reading */}
        {readingBooks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Currently Reading ({readingBooks.length})
            </h3>
            <div className="space-y-3">
              {readingBooks.map(book => (
                <div key={book.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{book.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBookStatus(book.id, 'completed')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* To Read */}
        {toReadBooks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              To Read ({toReadBooks.length})
            </h3>
            <div className="space-y-3">
              {toReadBooks.map(book => (
                <div key={book.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{book.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBookStatus(book.id, 'reading')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Start Reading
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedBooks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Completed ({completedBooks.length})
            </h3>
            <div className="space-y-3">
              {completedBooks.map(book => (
                <div key={book.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{book.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {books.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No books yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Start building your reading list by adding your first book.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Book
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 