'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function ImportData({ onImportEntries }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [importStatus, setImportStatus] = useState(null) // 'success', 'error', null
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = (file) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target.result
        
        if (file.name.endsWith('.json')) {
          // Handle JSON import
          const entries = JSON.parse(content)
          if (Array.isArray(entries)) {
            onImportEntries(entries)
            setImportStatus('success')
            setImportMessage(`Successfully imported ${entries.length} entries`)
          } else {
            throw new Error('Invalid JSON format - expected an array of entries')
          }
        } else if (file.name.endsWith('.csv')) {
          // Handle CSV import
          const entries = parseCSV(content)
          onImportEntries(entries)
          setImportStatus('success')
          setImportMessage(`Successfully imported ${entries.length} entries`)
        } else {
          throw new Error('Unsupported file format. Please use .json or .csv files.')
        }
      } catch (error) {
        setImportStatus('error')
        setImportMessage(`Import failed: ${error.message}`)
      }
    }
    
    reader.readAsText(file)
  }

  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const entries = []
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim())
        const entry = {}
        
        headers.forEach((header, index) => {
          let value = values[index] || ''
          
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1)
          }
          
          // Convert numeric values
          if (header === 'discipline' || header === 'surrender') {
            value = parseInt(value) || 3
          }
          
          entry[header] = value
        })
        
        // Generate ID and timestamp if missing
        if (!entry.id) {
          entry.id = Date.now() + i
        }
        if (!entry.timestamp) {
          entry.timestamp = new Date().toISOString()
        }
        
        entries.push(entry)
      }
    }
    
    return entries
  }

  const resetStatus = () => {
    setImportStatus(null)
    setImportMessage('')
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Upload size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold dark:text-white">Import Entries</h2>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Import your previously exported journal data. Supports JSON and CSV formats.
      </p>

      {/* Status Message */}
      {importStatus && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
          importStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
        }`}>
          {importStatus === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="text-sm">{importMessage}</span>
          <button 
            onClick={resetStatus}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileText size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Drag and drop your JSON or CSV file here
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          or click to browse files
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm"
        >
          Choose File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p><strong>JSON:</strong> Best for importing complete data with all structure preserved</p>
        <p><strong>CSV:</strong> Good for importing from spreadsheet applications</p>
      </div>
    </div>
  )
} 