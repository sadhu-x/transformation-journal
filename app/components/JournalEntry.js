'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../../lib/supabase'
import { Plus, Clock, ChevronDown, Paperclip, Link, X, Image as ImageIcon, FileText, Copy, ChevronLeft, ChevronRight, Upload, Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code, Link as LinkIcon, Edit3 } from 'lucide-react'
import AIAnalysis from './AIAnalysis'

// Markdown Editor Component
const MarkdownEditor = ({ value, onChange, placeholder, onFocus }) => {
  const textareaRef = useRef(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)
      
      if (e.shiftKey) {
        // Shift+Tab: Unindent
        const lines = selectedText.split('\n')
        const unindentedLines = lines.map(line => {
          if (line.startsWith('  ')) {
            return line.substring(2)
          } else if (line.startsWith('\t')) {
            return line.substring(1)
          }
          return line
        })
        const newText = value.substring(0, start) + unindentedLines.join('\n') + value.substring(end)
        onChange(newText)
        
        setTimeout(() => {
          const newEnd = start + unindentedLines.join('\n').length
          textarea.setSelectionRange(start, newEnd)
        }, 0)
      } else {
        // Tab: Indent
        const lines = selectedText.split('\n')
        const indentedLines = lines.map(line => '  ' + line)
        const newText = value.substring(0, start) + indentedLines.join('\n') + value.substring(end)
        onChange(newText)
        
        setTimeout(() => {
          const newEnd = start + indentedLines.join('\n').length
          textarea.setSelectionRange(start, newEnd)
        }, 0)
      }
    } else if (e.key === 'Enter') {
      const textarea = e.target
      const cursorPos = textarea.selectionStart
      const textBeforeCursor = value.substring(0, cursorPos)
      
      const lines = textBeforeCursor.split('\n')
      const currentLine = lines[lines.length - 1]
      
      // Auto-indent for lists
      if (currentLine.match(/^(\s*)([-*+]\s)/)) {
        const match = currentLine.match(/^(\s*)([-*+]\s)/)
        const indent = match[1]
        const listMarker = match[2]
        
        const newText = value.substring(0, cursorPos) + '\n' + indent + listMarker + value.substring(cursorPos)
        onChange(newText)
        
        setTimeout(() => {
          const newCursorPos = cursorPos + indent.length + listMarker.length + 1
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
        e.preventDefault()
      }
      // Auto-indent for numbered lists
      else if (currentLine.match(/^(\s*)(\d+\.\s)/)) {
        const match = currentLine.match(/^(\s*)(\d+\.\s)/)
        const indent = match[1]
        const number = parseInt(match[2])
        
        const newText = value.substring(0, cursorPos) + '\n' + indent + (number + 1) + '. ' + value.substring(cursorPos)
        onChange(newText)
        
        setTimeout(() => {
          const newCursorPos = cursorPos + indent.length + (number + 1).toString().length + 3
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
        e.preventDefault()
      }
    }
  }

  const formatButtons = [
    {
      label: 'Bold',
      icon: Bold,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, end + 2)
          textarea.focus()
        }, 0)
      }
    },
    {
      label: 'Italic',
      icon: Italic,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start + 1, end + 1)
          textarea.focus()
        }, 0)
      }
    },
    {
      label: 'Bullet List',
      icon: List,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const lines = selectedText.split('\n')
        const bulletedLines = lines.map(line => line ? `- ${line}` : line)
        const newText = value.substring(0, start) + bulletedLines.join('\n') + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start, start + newText.length - value.length)
          textarea.focus()
        }, 0)
      }
    },
    {
      label: 'Numbered List',
      icon: ListOrdered,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const lines = selectedText.split('\n').filter(line => line.trim())
        const numberedLines = lines.map((line, index) => `${index + 1}. ${line}`)
        const newText = value.substring(0, start) + numberedLines.join('\n') + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start, start + newText.length - value.length)
          textarea.focus()
        }, 0)
      }
    },
    {
      label: 'Heading 1',
      icon: Heading1,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + `# ${selectedText}` + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, end + 2)
          textarea.focus()
        }, 0)
      }
    },
    {
      label: 'Heading 2',
      icon: Heading2,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + `## ${selectedText}` + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start + 3, end + 3)
          textarea.focus()
        }, 0)
      }
    },
    {
      label: 'Quote',
      icon: Quote,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const lines = selectedText.split('\n')
        const quotedLines = lines.map(line => line ? `> ${line}` : line)
        const newText = value.substring(0, start) + quotedLines.join('\n') + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start, start + newText.length - value.length)
          textarea.focus()
        }, 0)
      }
    },
    {
      label: 'Code',
      icon: Code,
      action: () => {
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + `\`${selectedText}\`` + value.substring(end)
        onChange(newText)
        setTimeout(() => {
          textarea.setSelectionRange(start + 1, end + 1)
          textarea.focus()
        }, 0)
      }
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-1">
          {formatButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.action}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={button.label}
            >
              <button.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            isPreviewMode
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {isPreviewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-hidden">
        {isPreviewMode ? (
          <div className="h-full overflow-y-auto p-4">
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm max-w-none dark:prose-invert"
                components={{
                  // Custom link rendering
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {children}
                    </a>
                  ),
                  // Custom code rendering
                  code: ({ children, className }) => (
                    <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm`}>
                      {children}
                    </code>
                  ),
                  // Custom blockquote rendering
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                {placeholder}
              </div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            placeholder={placeholder}
            className="w-full h-full p-4 border-none focus:ring-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          />
        )}
      </div>
    </div>
  )
}

export default function JournalEntry({ onAddEntry, onOpenImageModal, imageComments, onUpdateImageComment, editingEntry, onClose, onUpdateEntryData, currentEntryIndex, totalEntries, onNavigateNext, onNavigatePrevious }) {
  const [entry, setEntry] = useState({
    content: '',
    attachments: []
  })
  const [currentTime, setCurrentTime] = useState('')
  const [newLink, setNewLink] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  // Load editing entry data when editingEntry changes
  useEffect(() => {
    if (editingEntry) {
      setEntry({
        content: editingEntry.content || '',
        attachments: editingEntry.attachments || []
      })
    } else {
      if (!isSubmitting) {
        setEntry({
          content: '',
          attachments: []
        })
        setNewLink('')
        setShowLinkInput(false)
      }
    }
  }, [editingEntry, isSubmitting])

  const resetEntry = () => {
    setEntry({
      content: '',
      attachments: []
    })
    setNewLink('')
    setShowLinkInput(false)
  }

  // Compress image to reduce storage size
  const compressImage = (base64String, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.onerror = () => resolve(base64String)
      img.src = base64String
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const compressedData = await compressImage(e.target.result)
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: compressedData,
              size: file.size
            }
            setEntry(prev => ({
              ...prev,
              attachments: [...prev.attachments, attachment]
            }))
          } catch (error) {
            console.error('Error compressing image:', error)
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: e.target.result,
              size: file.size
            }
            setEntry(prev => ({
              ...prev,
              attachments: [...prev.attachments, attachment]
            }))
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleLinkAdd = () => {
    if (newLink.trim()) {
      const attachment = {
        id: Date.now() + Math.random(),
        type: 'link',
        name: newLink,
        data: newLink,
        size: 0
      }
      setEntry(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment]
      }))
      setNewLink('')
      setShowLinkInput(false)
    }
  }

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
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const compressedData = await compressImage(e.target.result)
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: compressedData,
              size: file.size
            }
            setEntry(prev => ({
              ...prev,
              attachments: [...prev.attachments, attachment]
            }))
          } catch (error) {
            console.error('Error compressing image:', error)
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: e.target.result,
              size: file.size
            }
            setEntry(prev => ({
              ...prev,
              attachments: [...prev.attachments, attachment]
            }))
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeAttachment = (id) => {
    setEntry(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }))
  }

  const copyEntryAsJson = () => {
    const entryData = {
      content: entry.content,
      attachments: entry.attachments,
      timestamp: new Date().toISOString()
    }
    
    navigator.clipboard.writeText(JSON.stringify(entryData, null, 2))
      .then(() => {
        setCopyFeedback('Copied!')
        setTimeout(() => setCopyFeedback(null), 2000)
      })
      .catch(() => {
        setCopyFeedback('Failed to copy')
        setTimeout(() => setCopyFeedback(null), 2000)
      })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const entryData = {
        content: entry.content,
        attachments: entry.attachments,
        timestamp: new Date().toISOString()
      }

      if (onUpdateEntryData) {
        onUpdateEntryData(entryData)
      }

      if (onAddEntry) {
        await onAddEntry(entryData)
      }

      resetEntry()
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col">
        {/* Copy feedback notification */}
        {copyFeedback && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${
            copyFeedback === 'Copied!' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {copyFeedback}
          </div>
        )}

        {/* Header with navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Left side - Navigation arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onNavigatePrevious}
              disabled={currentEntryIndex <= 0}
              className={`p-2 rounded-md transition-colors ${
                currentEntryIndex <= 0
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Previous entry"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={onNavigateNext}
              disabled={currentEntryIndex >= totalEntries - 1}
              className={`p-2 rounded-md transition-colors ${
                currentEntryIndex >= totalEntries - 1
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Next entry"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Center - Entry info */}
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-purple-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {editingEntry && editingEntry.timestamp 
                ? new Date(editingEntry.timestamp).toLocaleString()
                : currentTime
              }
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAttachments(!showAttachments)}
              className={`p-2 rounded-md transition-colors ${
                showAttachments
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Attachments"
            >
              <Paperclip size={16} />
            </button>
            <button
              type="button"
              onClick={copyEntryAsJson}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Copy as JSON"
            >
              <Copy size={16} />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={() => onClose(entry)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Journal Entry */}
          <div className="flex-1">
            <MarkdownEditor
              value={entry.content}
              onChange={(value) => setEntry({...entry, content: value})}
              placeholder="Write freely about your day, thoughts, feelings, experiences, insights, or anything that's on your mind..."
            />
            
            {/* AI Analysis */}
            {editingEntry && (editingEntry.ai_analysis || editingEntry.ai_remedies || editingEntry.ai_prompts) && (
              <AIAnalysis 
                entry={editingEntry}
                onRefresh={async () => {
                  // Re-analyze the current entry
                  try {
                    const { analyzeEntryWithClaude } = await import('../../lib/dataService')
                    const result = await analyzeEntryWithClaude(editingEntry.content, editingEntry.id)
                    if (result.success) {
                      // Update the editing entry with new analysis
                      setEditingEntry(prev => ({
                        ...prev,
                        ai_analysis: result.analysis,
                        ai_remedies: result.remedies,
                        ai_prompts: result.prompts
                      }))
                    }
                  } catch (error) {
                    console.error('Failed to re-analyze entry:', error)
                  }
                }}
              />
            )}
          </div>

          {/* Attachments Panel */}
          {showAttachments && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
              {/* Drag & Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragOver 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <ImageIcon size={20} className={`mx-auto mb-2 ${isDragOver ? 'text-purple-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <p className={`text-sm ${isDragOver ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {isDragOver ? 'Drop images here' : 'Drag & drop images here, or'}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium underline"
                >
                  browse files
                </button>
              </div>
              
              {/* Attachment Controls */}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowLinkInput(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <Link size={14} className="text-gray-600 dark:text-gray-300" />
                  Add Link
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Link input */}
              {showLinkInput && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Enter URL..."
                    className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleLinkAdd}
                    className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkInput(false)
                      setNewLink('')
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Attachments List */}
              {entry.attachments.length > 0 && (
                <div className="mt-4 space-y-3">
                  {/* Image Thumbnails */}
                  {entry.attachments.filter(att => att.type === 'image').length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.attachments.filter(att => att.type === 'image').map((attachment) => (
                        <div key={attachment.id} className="relative group">
                          <img
                            src={attachment.data}
                            alt={attachment.name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onOpenImageModal && onOpenImageModal(attachment)}
                          />
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  {entry.attachments.filter(att => att.type === 'link').length > 0 && (
                    <div className="space-y-2">
                      {entry.attachments.filter(att => att.type === 'link').map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <a
                            href={attachment.data}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate flex-1"
                          >
                            {attachment.data}
                          </a>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {entry.content.length} characters
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetEntry}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !entry.content.trim()}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
} 