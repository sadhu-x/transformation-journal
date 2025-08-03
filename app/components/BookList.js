import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, CheckCircle, Clock, Target, TrendingUp, Heart, Brain, DollarSign, Zap, Lightbulb } from 'lucide-react'
import { getPersonalizedRecommendations, getPersonalizedReadingSchedule, getCategoryBalanceRecommendations, getCosmicReadingRecommendations } from '../../lib/bookDatabase'
import { getBooks, addBook, updateBook, deleteBook } from '../../lib/dataService'

export default function BookList({ userProfile, cosmicData }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  // Load books from Supabase or localStorage fallback
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log('Loading books...')
        
        // Load user's existing books from Supabase or localStorage fallback
        const existingBooks = await getBooks()
        console.log('Existing books loaded:', existingBooks?.length || 0)
        
        if (existingBooks && existingBooks.length > 0) {
          setBooks(existingBooks)
          setLoading(false)
          return
        }
        
        // Only initialize with recommendations if no existing books
        console.log('No existing books found, initializing with recommendations...')
        
        // Safely get personalized recommendations
        let initialBooks = []
        try {
          const safeUserProfile = userProfile || {}
          initialBooks = getPersonalizedRecommendations(safeUserProfile) || []
          console.log('Initial books generated:', initialBooks.length)
        } catch (recError) {
          console.error('Error generating recommendations:', recError)
          // Fallback to empty array
          initialBooks = []
        }
        
        // Add initial books to database only if we have some
        if (initialBooks.length > 0) {
          const addedBooks = []
          for (const book of initialBooks) {
            try {
              const addedBook = await addBook(book)
              if (addedBook) {
                addedBooks.push(addedBook)
              }
            } catch (addError) {
              console.error('Error adding initial book:', addError)
              // Continue with other books even if one fails
            }
          }
          setBooks(addedBooks)
        } else {
          setBooks([])
        }
        
      } catch (error) {
        console.error('Error loading books:', error)
        setError('Failed to load books. Please try refreshing the page.')
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [userProfile])

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

  const handleAddBook = async () => {
    if (newBook.title && newBook.author) {
      try {
        console.log('Adding book to Supabase:', newBook)
        const addedBook = await addBook(newBook)
        console.log('addBook result:', addedBook)
        
        if (addedBook) {
          console.log('Book added successfully, updating state')
          setBooks(prev => [addedBook, ...prev])
          setNewBook({
            title: '',
            author: '',
            category: 'business_financial',
            priority: 'medium',
            status: 'to_read',
            notes: ''
          })
          setShowAddForm(false)
        } else {
          console.log('addBook returned null/undefined')
        }
      } catch (error) {
        console.error('Error adding book:', error)
      }
    }
  }

  const updateBookStatus = async (bookId, newStatus) => {
    try {
      const updatedBook = await updateBook(bookId, { status: newStatus })
      if (updatedBook) {
        setBooks(prev => prev.map(book => 
          book.id === bookId ? updatedBook : book
        ))
      }
    } catch (error) {
      console.error('Error updating book status:', error)
    }
  }

  const handleDeleteBook = async (bookId) => {
    try {
      const success = await deleteBook(bookId)
      if (success) {
        setBooks(prev => prev.filter(book => book.id !== bookId))
      }
    } catch (error) {
      console.error('Error deleting book:', error)
    }
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

  console.log('BookList rendering with:', { books: books.length, loading, error })

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading your reading list...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
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
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">To Read</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {toReadBooks.length}
                </p>
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
              <div className="w-full mt-4">
                <textarea
                  placeholder="Notes (optional)"
                  value={newBook.notes}
                  onChange={(e) => setNewBook({...newBook, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddBook}
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
                    <BookItem key={book.id} book={book} categories={categories} onStatusChange={updateBookStatus} onDelete={handleDeleteBook} />
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
                    <BookItem key={book.id} book={book} categories={categories} onStatusChange={updateBookStatus} onDelete={handleDeleteBook} />
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
                    <BookItem key={book.id} book={book} categories={categories} onStatusChange={updateBookStatus} onDelete={handleDeleteBook} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {books.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
        </>
      )}
    </div>
  )
}

function BookItem({ book, categories, onStatusChange, onDelete }) {
  const CategoryIcon = categories[book.category]?.icon || BookOpen

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'reading': return <BookOpen className="w-4 h-4 text-blue-600" />
      case 'to_read': return <Clock className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
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
        <button
          onClick={() => onDelete(book.id)}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
} 