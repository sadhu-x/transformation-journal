'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { generateInstructionTemplate } from '../../lib/dataService'
import { supabase } from '../../lib/supabase'
import { Plus, Clock, Brain, Heart, TrendingUp, Zap, ChevronDown, Paperclip, Link, X, Image as ImageIcon, FileText, Scale, Heart as HeartIcon, Lightbulb, Paperclip as PaperclipIcon, AlertTriangle, Copy, Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code, Link as LinkIcon, ChevronLeft, ChevronRight, Upload, Target, Eye, Sun, Shield, CheckSquare, Eye as EyeIcon, Edit3 } from 'lucide-react'

const energyLevels = ['Depleted', 'Low', 'Moderate', 'Good', 'High', 'Peak', 'Transcendent']
const clarityLevels = ['Foggy', 'Unclear', 'Somewhat Clear', 'Clear', 'Very Clear', 'Crystal Clear', 'Illuminated']
const presenceLevels = ['Scattered', 'Distracted', 'Somewhat Present', 'Present', 'Very Present', 'Deeply Present', 'One-Pointed']
const resistanceLevels = ['No Resistance', 'Minimal', 'Some', 'Moderate', 'High', 'Very High', 'Complete Block']
const disciplineLevels = ['No Structure', 'Chaotic', 'Some Structure', 'Moderate', 'Good Focus', 'Strong Will', 'Masterful']
const disciplineTooltips = [
  'Complete lack of structure and order',
  'Disorganized and scattered approach',
  'Basic structure and routine emerging',
  'Balanced structure and flexibility',
  'Strong focus and consistent action',
  'Powerful will and determination',
  'Masterful discipline and self-control'
]
const surrenderLevels = ['Fighting', 'Resisting', 'Some Trust', 'Letting Go', 'Flowing', 'Surrendered', 'Fully Surrendered']
const surrenderTooltips = [
  'Actively resisting what is',
  'Pushing against natural currents',
  'Beginning to trust the process',
  'Releasing control and resistance',
  'Moving with life\'s natural rhythm',
  'Trusting and accepting what is',
  'Complete trust in life\'s wisdom'
]

const emotionOptions = [
  // Positive emotions
  'Joy', 'Gratitude', 'Love', 'Peace', 'Excitement', 'Confidence', 'Inspiration', 'Curiosity', 'Amusement', 'Awe',
  // Neutral emotions
  'Calm', 'Content', 'Focused', 'Present', 'Balanced', 'Centered', 'Mindful', 'Accepting',
  // Challenging emotions
  'Anxiety', 'Fear', 'Anger', 'Frustration', 'Sadness', 'Loneliness', 'Guilt', 'Shame', 'Jealousy', 'Envy',
  'Overwhelm', 'Stress', 'Irritation', 'Impatience', 'Doubt', 'Confusion', 'Disappointment', 'Resentment'
]

// Markdown Editor Component
const MarkdownEditor = ({ value, onChange, placeholder, fieldId, onFocus }) => {
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
          // Remove one level of indentation (2 spaces or 1 tab)
          if (line.startsWith('  ')) {
            return line.substring(2)
          } else if (line.startsWith('\t')) {
            return line.substring(1)
          }
          return line
        })
        const newText = value.substring(0, start) + unindentedLines.join('\n') + value.substring(end)
        onChange(newText)
        
        // Restore selection
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
        
        // Restore selection
        setTimeout(() => {
          const newEnd = start + indentedLines.join('\n').length
          textarea.setSelectionRange(start, newEnd)
        }, 0)
      }
    } else if (e.key === 'Enter') {
      const textarea = e.target
      const cursorPos = textarea.selectionStart
      const textBeforeCursor = value.substring(0, cursorPos)
      
      // Get the current line
      const lines = textBeforeCursor.split('\n')
      const currentLine = lines[lines.length - 1]
      
      // Check if current line is a list item
      const bulletMatch = currentLine.match(/^(\s*)(-\s)/)
      const numberMatch = currentLine.match(/^(\s*)(\d+\.\s)/)
      
      if (bulletMatch) {
        // Auto-continue bullet list
        e.preventDefault()
        const indent = bulletMatch[1]
        const bullet = bulletMatch[2]
        const newText = value.substring(0, cursorPos) + '\n' + indent + bullet + value.substring(cursorPos)
        onChange(newText)
        
        // Set cursor position after the new bullet
        setTimeout(() => {
          const newCursorPos = cursorPos + 1 + indent.length + bullet.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
      } else if (numberMatch) {
        // Auto-continue numbered list
        e.preventDefault()
        const indent = numberMatch[1]
        const currentNumber = parseInt(numberMatch[2])
        
        // Find the next number in the list
        const allLines = value.split('\n')
        let nextNumber = currentNumber + 1
        
        // Look for the next numbered item to determine the correct number
        for (let i = lines.length; i < allLines.length; i++) {
          const lineMatch = allLines[i].match(/^(\s*)(\d+\.\s)/)
          if (lineMatch && lineMatch[1] === indent) {
            nextNumber = Math.max(nextNumber, parseInt(lineMatch[2]) + 1)
          }
        }
        
        const newText = value.substring(0, cursorPos) + '\n' + indent + nextNumber + '. ' + value.substring(cursorPos)
        onChange(newText)
        
        // Set cursor position after the new number
        setTimeout(() => {
          const newCursorPos = cursorPos + 1 + indent.length + (nextNumber + '. ').length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
      }
    }
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Toggle Button */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
          title={isPreviewMode ? 'Switch to Edit Mode' : 'Switch to Preview Mode'}
        >
          {isPreviewMode ? (
            <>
              <Edit3 size={12} />
              Edit
            </>
          ) : (
            <>
              <EyeIcon size={12} />
              Preview
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {isPreviewMode ? (
          /* Markdown Preview */
          <div className="w-full h-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white overflow-y-auto max-h-full">
            {value ? (
              <div className="prose prose-sm dark:prose-invert max-w-none min-h-full">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom checkbox rendering
                    input: ({ checked, ...props }) => (
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="mr-2"
                        {...props}
                      />
                    ),
                    // Custom link rendering
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
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
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                {placeholder}
              </div>
            )}
          </div>
        ) : (
          /* Textarea Editor */
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus && onFocus(fieldId)}
            placeholder={placeholder}
            className="w-full h-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            data-field-id={fieldId}
          />
        )}
      </div>
    </div>
  )
}

export default function JournalEntry({ onAddEntry, onOpenImageModal, imageComments, onUpdateImageComment, editingEntry, onClose, onUpdateEntryData, currentEntryIndex, totalEntries, onNavigateNext, onNavigatePrevious }) {
  const [entry, setEntry] = useState({
    activity: '',
    gratitude: '',
    pain: '',
    insight: '',
    aiResponse: '',
    wishFulfilled: '',
    discipline: 3,
    surrender: 3
  })
  const [currentTime, setCurrentTime] = useState('')
  const [attachments, setAttachments] = useState([])
  const [newLink, setNewLink] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [copyFeedback, setCopyFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 })
  const [timer, setTimer] = useState({ isRunning: false, timeLeft: 300, duration: 300 }) // 5 minutes default
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [copyData, setCopyData] = useState('')
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const tabs = [
    { id: 0, name: 'Review of Activities', icon: FileText },
            { id: 1, name: 'Gratitude and Love', icon: HeartIcon },
            { id: 2, name: 'Pain and Challenges', icon: AlertTriangle },
    { id: 3, name: 'Insights & Next Steps', icon: Lightbulb },
    { id: 4, name: 'Wish Fulfilled', icon: Zap },
    { id: 5, name: 'Attachments', icon: PaperclipIcon },
    { id: 6, name: 'AI Response', icon: Brain }
  ]

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  // Load editing entry data when editingEntry changes
  useEffect(() => {
    if (editingEntry) {
      setEntry({
        activity: editingEntry.activity || '',
        gratitude: editingEntry.gratitude || '',
        pain: editingEntry.pain || '',
        insight: editingEntry.insight || '',
        aiResponse: editingEntry.aiResponse || '',
        wishFulfilled: editingEntry.wishFulfilled || '',
            discipline: editingEntry.discipline || 3,
    surrender: editingEntry.surrender || 3
      })
      setAttachments(editingEntry.attachments || [])
    } else {
      // Only reset if we're not in the middle of submitting
      if (!isSubmitting) {
        setEntry({
          activity: '',
          gratitude: '',
          pain: '',
          insight: '',
          aiResponse: '',
          discipline: 3,
          surrender: 3
        })
        setAttachments([])
        setNewLink('')
        setShowLinkInput(false)
      }
    }
  }, [editingEntry, isSubmitting])



  const resetEntry = () => {
    setEntry({
      activity: '',
      gratitude: '',
      pain: '',
      insight: '',
      aiResponse: '',
      wishFulfilled: '',
      discipline: 3,
      surrender: 3
    })
    setAttachments([])
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
        
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.onerror = () => resolve(base64String) // Fallback to original if compression fails
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
            // Compress the image before storing
            const compressedData = await compressImage(e.target.result)
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: compressedData,
              size: file.size
            }
            setAttachments(prev => [...prev, attachment])
          } catch (error) {
            console.error('Error compressing image:', error)
            // Fallback to original image
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: e.target.result,
              size: file.size
            }
            setAttachments(prev => [...prev, attachment])
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
        url: newLink.trim(),
        title: newLink.trim()
      }
      setAttachments(prev => [...prev, attachment])
      setNewLink('')
      setShowLinkInput(false)
    }
  }

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            // Compress the image before storing
            const compressedData = await compressImage(e.target.result)
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: compressedData,
              size: file.size
            }
            setAttachments(prev => [...prev, attachment])
          } catch (error) {
            console.error('Error compressing image:', error)
            // Fallback to original image
            const attachment = {
              id: Date.now() + Math.random(),
              type: 'image',
              name: file.name,
              data: e.target.result,
              size: file.size
            }
            setAttachments(prev => [...prev, attachment])
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }



  const handleSubmit = (e) => {
    e.preventDefault()
    if (entry.activity) {
      setIsSubmitting(true)
      onAddEntry({
        ...entry,
        attachments: attachments.map(att => ({
          ...att,
          comment: att.type === 'image' ? imageComments[att.id] || '' : att.comment || ''
        }))
      })
      // Reset the submitting state after a short delay to allow modal to close
      setTimeout(() => {
        setIsSubmitting(false)
      }, 200)
    }
  }

  const copyEntryAsJson = async () => {
    try {
      const currentEntry = {
        ...entry,
        attachments: attachments.map(att => ({
          ...att,
          comment: att.type === 'image' ? imageComments[att.id] || '' : att.comment || ''
        }))
      }
      
      const entryJson = JSON.stringify(currentEntry, null, 2)
      
      // Get user configuration for personalized instructions
      let userConfig = JSON.parse(localStorage.getItem('user-config') || '{}')
      console.log('User config loaded from localStorage for copy:', userConfig)
      
      // Also check Supabase user metadata (like UserProfile does)
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser?.user_metadata?.userConfig) {
          const supabaseConfig = currentUser.user_metadata.userConfig
          userConfig = { ...userConfig, ...supabaseConfig }
          console.log('User config loaded from Supabase for copy:', supabaseConfig)
        }
      } catch (error) {
        console.error('Error loading user config from Supabase for copy:', error)
      }
      
      console.log('Final user config for copy:', userConfig)
      const instructions = await generateInstructionTemplate(userConfig)
      console.log('Generated instructions:', instructions.substring(0, 200) + '...')
      
      const contextTemplate = `${instructions}

## Data Period
**Entry Date**: Current Entry (Draft)
**Entry ID**: Draft

---

## JSON DATA:
\`\`\`json
${entryJson}
\`\`\`

---`

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(contextTemplate)
          setCopyFeedback('Copied!')
          setTimeout(() => setCopyFeedback(null), 2000)
          console.log('Entry copied to clipboard successfully')
          return
        } catch (clipboardError) {
          console.warn('Modern clipboard API failed, trying fallback:', clipboardError)
        }
      }

      // Fallback: Create temporary textarea and copy
      const textarea = document.createElement('textarea')
      textarea.value = contextTemplate
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      
      textarea.select()
      textarea.setSelectionRange(0, 99999) // For mobile devices
      
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          setCopyFeedback('Copied!')
          setTimeout(() => setCopyFeedback(null), 2000)
          console.log('Entry copied to clipboard using fallback method')
        } else {
          throw new Error('execCommand copy failed')
        }
      } catch (execError) {
        console.error('Fallback copy method failed:', execError)
        // Last resort: create downloadable file
        try {
          const blob = new Blob([contextTemplate], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `journal-entry-${new Date().toISOString().split('T')[0]}.txt`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          setCopyFeedback('Downloaded as file!')
          setTimeout(() => setCopyFeedback(null), 3000)
          console.log('Entry downloaded as file successfully')
        } catch (downloadError) {
          console.error('Download fallback also failed:', downloadError)
          // Final fallback: show in modal
          setCopyData(contextTemplate)
          setShowCopyModal(true)
          setCopyFeedback('Showing in modal')
          setTimeout(() => setCopyFeedback(null), 2000)
          console.log('All copy methods failed. Showing data in modal.')
        }
      } finally {
        document.body.removeChild(textarea)
      }
      
    } catch (error) {
      console.error('Failed to copy entry:', error)
      setCopyFeedback('Copy failed')
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  // Global formatting functions
  const insertMarkdownToFocusedField = (before, after = '') => {
    if (!focusedField) return

    const fieldValue = entry[focusedField]
    const textarea = document.querySelector(`textarea[data-field-id="${focusedField}"]`)
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = fieldValue.substring(start, end)
    
    let newText
    let newCursorPos
    
    // Handle multi-line list formatting
    if ((before === '- ' || before === '1. ') && selectedText.includes('\n')) {
      const lines = selectedText.split('\n')
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        if (trimmedLine === '') return line
        
        // Check if line already has list formatting
        const hasBullet = trimmedLine.startsWith('- ')
        const hasNumber = /^\d+\.\s/.test(trimmedLine)
        
        if (before === '- ' && hasBullet) {
          // Remove bullet if already present
          return line.replace(/^(\s*)-\s/, '$1')
        } else if (before === '1. ' && hasNumber) {
          // Remove number if already present
          return line.replace(/^(\s*)\d+\.\s/, '$1')
        } else if (before === '- ' && !hasBullet && !hasNumber) {
          // Add bullet
          return line.replace(/^(\s*)/, '$1- ')
        } else if (before === '1. ' && !hasBullet && !hasNumber) {
          // Add number
          const indent = line.match(/^(\s*)/)[1]
          return line.replace(/^(\s*)/, '$1' + (lines.indexOf(line) + 1) + '. ')
        }
        return line
      })
      
      newText = fieldValue.substring(0, start) + formattedLines.join('\n') + fieldValue.substring(end)
      newCursorPos = start + formattedLines.join('\n').length
    } else {
      // Handle single-line or other formatting
      newText = fieldValue.substring(0, start) + before + selectedText + after + fieldValue.substring(end)
      newCursorPos = start + before.length + selectedText.length + after.length
    }
    
    setEntry(prev => ({ ...prev, [focusedField]: newText }))
    
    // Set cursor position without selection
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const handleFieldFocus = (fieldId) => {
    console.log('Field focused:', fieldId)
    setFocusedField(fieldId)
  }

  const showTooltip = (text, event) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    setTooltip({
      show: true,
      text,
      x: rect.left + (rect.width / 2),
      y: rect.top - 8
    })
  }

  const hideTooltip = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 })
  }

  // Timer functions
  const startTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: true }))
  }

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }))
  }

  const resetTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false, timeLeft: prev.duration }))
  }

  const setTimerDuration = (minutes) => {
    const seconds = minutes * 60
    setTimer(prev => ({ 
      ...prev, 
      duration: seconds, 
      timeLeft: prev.isRunning ? prev.timeLeft : seconds 
    }))
  }

  // Timer effect
  useEffect(() => {
    let interval = null
    if (timer.isRunning && timer.timeLeft > 0) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }))
      }, 1000)
    } else if (timer.timeLeft === 0) {
      setTimer(prev => ({ ...prev, isRunning: false }))
    }
    return () => clearInterval(interval)
  }, [timer.isRunning, timer.timeLeft])

  // Reset timer when tab changes
  useEffect(() => {
    resetTimer()
  }, [activeTab])

  // Update parent component with current entry data
  useEffect(() => {
    if (onUpdateEntryData) {
      onUpdateEntryData(entry)
    }
  }, [entry, onUpdateEntryData])

  // Periodic auto-save every 30 seconds if there's content
  useEffect(() => {
    const hasContent = entry.activity?.trim() || 
                      entry.gratitude?.trim() || 
                      entry.presence?.trim() || 
                      entry.insights?.trim() || 
                      entry.wishFulfilled?.trim() || 
                      entry.aiResponse?.trim() ||
                      (entry.attachments && entry.attachments.length > 0)

    if (hasContent) {
      const autoSaveInterval = setInterval(() => {
        // Only auto-save if we have content and it's not an existing entry being edited
        if (hasContent && !editingEntry?.id) {
          onAddEntry(entry)
          console.log('Auto-saved entry (periodic)')
        }
      }, 30000) // 30 seconds

      return () => clearInterval(autoSaveInterval)
    }
  }, [entry, editingEntry, onAddEntry])

  const formatButtons = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdownToFocusedField('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdownToFocusedField('*', '*') },
    { icon: Heading1, label: 'Heading 1', action: () => insertMarkdownToFocusedField('# ') },
    { icon: Heading2, label: 'Heading 2', action: () => insertMarkdownToFocusedField('## ') },
    { icon: List, label: 'Bullet List', action: () => insertMarkdownToFocusedField('- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdownToFocusedField('1. ') },
    { icon: CheckSquare, label: 'Checkbox', action: () => insertMarkdownToFocusedField('- [ ] ') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdownToFocusedField('> ') },
    { icon: Code, label: 'Code', action: () => insertMarkdownToFocusedField('`', '`') },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdownToFocusedField('[', '](url)') },
  ]

  const getScaleLabel = (value, scale) => {
    const scales = {
      energy: energyLevels,
      clarity: clarityLevels,
      presence: presenceLevels,
      resistance: resistanceLevels,
      discipline: disciplineLevels,
      surrender: surrenderLevels
    }
    return scales[scale][value] || value
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const ScaleInput = ({ label, value, onChange, scaleType, icon: Icon, color = "blue", tooltips }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

    const handleMouseEnter = (e) => {
      if (tooltips) {
        const rect = e.target.getBoundingClientRect()
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 5
        })
        setShowTooltip(true)
      }
    }

    const handleMouseLeave = () => {
      setShowTooltip(false)
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className={color === 'blue' ? 'text-blue-600 dark:text-blue-400' : color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'} />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        </div>
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="6"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
          />
          <div className="text-xs text-center text-gray-600 dark:text-gray-400 relative">
            <span
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {getScaleLabel(value, scaleType)} ({value}/6)
            </span>
            {showTooltip && tooltips && (
              <div
                className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap"
                style={{
                  left: '50%',
                  bottom: '25px',
                  transform: 'translateX(-50%)'
                }}
              >
                {tooltips[value]}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
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

        {/* Custom Tooltip */}
        {tooltip.show && createPortal(
          <div 
            className="fixed z-[9999] px-3 py-2 text-sm bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 rounded-md shadow-lg border border-gray-600 dark:border-gray-500 pointer-events-none transition-opacity duration-200 whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
          >
            {tooltip.text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>,
          document.body
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
              onClick={copyEntryAsJson}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
              title="Copy as JSON"
            >
              <Copy size={16} />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={() => onClose(entry)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-between items-center px-4 pt-3 pb-2">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={(e) => showTooltip(tab.name, e)}
                  onMouseLeave={hideTooltip}
                  className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent size={16} />
                </button>
              )
            })}
          </div>
          
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
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
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          {/* Tab 0: Review of Activities */}
          {activeTab === 0 && (
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Review of Activities</label>
              </div>
              <div className="flex-1 mb-6">
                <MarkdownEditor
                  value={entry.activity}
                  onChange={(value) => setEntry({...entry, activity: value})}
                  placeholder="What activities have you been doing? (e.g., morning routine, work session, exercise, meditation, social interactions, etc.)"
                  fieldId="activity"
                  onFocus={handleFieldFocus}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScaleInput
                  label="Discipline"
                  value={entry.discipline}
                  onChange={(value) => setEntry({...entry, discipline: value})}
                  scaleType="discipline"
                  icon={TrendingUp}
                  color="amber"
                  tooltips={disciplineTooltips}
                />
                <ScaleInput
                  label="Surrender"
                  value={entry.surrender}
                  onChange={(value) => setEntry({...entry, surrender: value})}
                  scaleType="surrender"
                  icon={Zap}
                  color="indigo"
                  tooltips={surrenderTooltips}
                />
              </div>
            </div>
          )}

          {/* Tab 1: Gratitude */}
          {activeTab === 1 && (
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gratitude and Love</label>
              </div>
              <div className="flex-1">
                <MarkdownEditor
                  value={entry.gratitude}
                  onChange={(value) => setEntry({...entry, gratitude: value})}
                  placeholder="What are you grateful for right now? What blessings, people, experiences, or moments are you appreciating?"
                  fieldId="gratitude"
                  onFocus={handleFieldFocus}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Pain */}
          {activeTab === 2 && (
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pain and Challenges</label>
              </div>
              <div className="flex-1">
                <MarkdownEditor
                  value={entry.pain}
                  onChange={(value) => setEntry({...entry, pain: value})}
                  placeholder="What pain, discomfort, or blockages are you experiencing? What feels heavy, stuck, or challenging? Allow yourself to acknowledge and accept these feelings."
                  fieldId="pain"
                  onFocus={handleFieldFocus}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Insights & Next Steps */}
          {activeTab === 3 && (
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Insights and Next Steps</label>
              </div>
              <div className="flex-1">
                <MarkdownEditor
                  value={entry.insight}
                  onChange={(value) => setEntry({...entry, insight: value})}
                  placeholder="Any awareness, understanding, or realizations emerging? What patterns, truths, or wisdom are you discovering? What are your next steps or intentions?"
                  fieldId="insight"
                  onFocus={handleFieldFocus}
                />
              </div>
            </div>
          )}

          {/* Tab 6: AI Response */}
          {activeTab === 6 && (
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Response</label>
              </div>
              <div className="flex-1">
                <MarkdownEditor
                  value={entry.aiResponse}
                  onChange={(value) => setEntry({...entry, aiResponse: value})}
                  placeholder="Paste your AI response here... This could be insights from ChatGPT, Claude, or any other AI assistant that you want to record and reflect on."
                  fieldId="aiResponse"
                  onFocus={handleFieldFocus}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Wish Fulfilled */}
          {activeTab === 4 && (
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Wish Fulfilled</label>
              </div>
              <div className="flex-1">
                <MarkdownEditor
                  value={entry.wishFulfilled}
                  onChange={(value) => setEntry({...entry, wishFulfilled: value})}
                  placeholder="Write as if your wish has already been fulfilled. Feel the emotions, see the details, experience the reality of having what you desire. What does it feel like to have achieved this? What are you doing, seeing, experiencing? Use present tense and vivid sensory details."
                  fieldId="wishFulfilled"
                  onFocus={handleFieldFocus}
                />
              </div>
            </div>
          )}

          {/* Tab 5: Attachments & Links */}
          {activeTab === 5 && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <ImageIcon size={24} className={`mx-auto mb-2 ${isDragOver ? 'text-purple-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <p className={`text-sm ${isDragOver ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {isDragOver ? 'Drop images here' : 'Drag & drop images here, or'}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium underline"
                >
                  browse files
                </button>
              </div>
              
              {/* Attachment Controls */}
              <div className="flex gap-2">
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
                <div className="flex gap-2">
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
              {attachments.length > 0 && (
                <div className="space-y-3">
                  {/* Image Thumbnails */}
                  {attachments.filter(att => att.type === 'image').length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.filter(att => att.type === 'image').map((attachment) => (
                        <div key={attachment.id} className="relative group">
                          <img
                            src={attachment.data}
                            alt="Uploaded image"
                            className="w-32 h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onOpenImageModal(attachment)}
                          />
                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Link Attachments */}
                  {attachments.filter(att => att.type === 'link').map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <Link size={16} className="text-green-500" />
                      <span className="flex-1 text-sm truncate text-gray-700 dark:text-gray-200">
                        {attachment.url}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
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

        {/* Submit Button */}
        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex-1 flex items-center gap-4">
            {currentEntryIndex >= 0 && totalEntries > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentEntryIndex + 1} of {totalEntries}
              </span>
            )}
            
            {/* Timer */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-purple-600" />
                <span className={`text-sm font-mono ${timer.timeLeft <= 60 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatTime(timer.timeLeft)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!timer.isRunning ? (
                  <button
                    type="button"
                    onClick={startTimer}
                    className="p-1 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    title="Start timer"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    className="p-1 text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                    title="Pause timer"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Reset timer"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <select
                value={timer.duration / 60}
                onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                title="Timer duration"
              >
                <option value={1}>1m</option>
                <option value={3}>3m</option>
                <option value={5}>5m</option>
                <option value={10}>10m</option>
                <option value={15}>15m</option>
                <option value={30}>30m</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Copy Data Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Journal Entry Data
              </h3>
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <textarea
                value={copyData}
                readOnly
                className="w-full h-full p-4 text-sm font-mono bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md resize-none"
                style={{ minHeight: '400px' }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  const textarea = document.querySelector('textarea[readonly]')
                  if (textarea) {
                    textarea.select()
                    try {
                      document.execCommand('copy')
                      setCopyFeedback('Copied from modal!')
                      setTimeout(() => setCopyFeedback(null), 2000)
                    } catch (e) {
                      console.error('Copy from modal failed:', e)
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Copy Text
              </button>
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 