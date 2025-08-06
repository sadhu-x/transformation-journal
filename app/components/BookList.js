import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, CheckCircle, Clock, Heart, Brain, DollarSign } from 'lucide-react'
import { getBooks, addBook, updateBook, deleteBook } from '../../lib/dataService'

export default function BookList({ userProfile, cosmicData }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
        
        setBooks(existingBooks || [])
        
      } catch (error) {
        console.error('Error loading books:', error)
        setError('Failed to load books. Please try refreshing the page.')
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

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
          {/* Header with Add Book Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading List</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your personal reading journey
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </button>
          </div>

          {/* Reading Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Total Books</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{books.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedBooks.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Reading</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{readingBooks.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">To Read</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{toReadBooks.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Book Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Book</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Book title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="business_financial">Business & Financial</option>
                    <option value="spiritual_development">Spiritual Development</option>
                    <option value="personal_development">Personal Development</option>
                    <option value="diverse_learning">Diverse Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newBook.priority}
                    onChange={(e) => setNewBook(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="essential">Essential</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newBook.notes}
                    onChange={(e) => setNewBook(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Optional notes about this book..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBook}
                  disabled={!newBook.title || !newBook.author}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Add Book
                </button>
              </div>
            </div>
          )}

          {/* Books List */}
          {books.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your reading list by adding your first book.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Book
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <BookItem
                  key={book.id}
                  book={book}
                  categories={categories}
                  onStatusChange={updateBookStatus}
                  onDelete={handleDeleteBook}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BookItem({ book, categories, onStatusChange, onDelete }) {
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

  const category = categories[book.category]
  const CategoryIcon = category?.icon || BookOpen

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <CategoryIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{book.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(book.priority)}`}>
              {book.priority}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">by {book.author}</p>
          <div className="flex items-center space-x-4 mb-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${category?.color}`}>
              {category?.name}
            </span>
            <span className="inline-flex items-center text-sm text-gray-500">
              {getStatusIcon(book.status)}
              <span className="ml-1 capitalize">{book.status.replace('_', ' ')}</span>
            </span>
            {book.completed_at && (
              <span className="text-sm text-gray-500">
                Completed: {new Date(book.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
          {book.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
              {book.notes}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <select
            value={book.status}
            onChange={(e) => onStatusChange(book.id, e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
          >
            <option value="to_read">To Read</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => onDelete(book.id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete book"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 