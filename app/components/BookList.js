import React, { useState } from 'react'

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

  console.log('BookList rendering - minimal version')

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
      </div>

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