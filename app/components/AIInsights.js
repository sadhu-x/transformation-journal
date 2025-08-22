'use client'

import { useState, useEffect } from 'react'
import { Brain, Lightbulb, Heart, Target, Clock, Sparkles, ChevronDown, ChevronUp, RefreshCw, Calendar, Search } from 'lucide-react'
import AIAnalysis from './AIAnalysis'

export default function AIInsights({ entries }) {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter entries that have AI analysis
  const entriesWithAI = entries.filter(entry => 
    entry.ai_analysis || entry.ai_remedies || entry.ai_prompts
  )
  
  // Filter entries based on search term
  const filteredEntries = entriesWithAI.filter(entry => {
    if (!searchTerm) return true
    const content = entry.content?.toLowerCase() || ''
    const themes = entry.ai_analysis?.key_themes?.join(' ').toLowerCase() || ''
    const emotional_state = entry.ai_analysis?.emotional_state?.toLowerCase() || ''
    return content.includes(searchTerm.toLowerCase()) || 
           themes.includes(searchTerm.toLowerCase()) ||
           emotional_state.includes(searchTerm.toLowerCase())
  })

  // Auto-select first entry if none selected
  useEffect(() => {
    if (filteredEntries.length > 0 && !selectedEntry) {
      setSelectedEntry(filteredEntries[0])
    }
  }, [filteredEntries, selectedEntry])

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stripMarkdown = (text) => {
    if (!text) return ''
    return text
      .replace(/[#*`_~]/g, '') // Remove markdown characters
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
      .replace(/\n+/g, ' ') // Replace line breaks with spaces
      .trim()
  }

  if (entriesWithAI.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No AI Analysis Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Create journal entries with substantial content (50+ characters) to see AI insights.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Write about your thoughts, feelings, experiences, or challenges to get personalized insights and suggestions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={24} className="text-purple-600 dark:text-purple-400" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Insights
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {entriesWithAI.length} entries analyzed
            </p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Analyzed Entries
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedEntry?.id === entry.id 
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500' 
                      : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} />
                      <span>{formatDate(entry.timestamp)} {formatTime(entry.timestamp)}</span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {entry.content ? 
                        (() => {
                          const plainText = stripMarkdown(entry.content)
                          return plainText.length > 60 ? 
                            `${plainText.substring(0, 60)}...` : 
                            plainText
                        })()
                      : 
                        'No content'
                      }
                    </div>
                    {entry.ai_analysis?.key_themes && (
                      <div className="flex flex-wrap gap-1">
                        {entry.ai_analysis.key_themes.slice(0, 2).map((theme, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                          >
                            {theme}
                          </span>
                        ))}
                        {entry.ai_analysis.key_themes.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{entry.ai_analysis.key_themes.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Display */}
        <div className="lg:col-span-2">
          {selectedEntry ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <Calendar size={14} />
                  <span>{formatDate(selectedEntry.timestamp)} {formatTime(selectedEntry.timestamp)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Entry Analysis
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedEntry.content ? stripMarkdown(selectedEntry.content) : 'No content'}
                  </p>
                </div>
              </div>
              
              <AIAnalysis 
                entry={selectedEntry}
                onRefresh={async () => {
                  // Re-analyze functionality could be added here
                  console.log('Refresh analysis for entry:', selectedEntry.id)
                }}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Brain size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">
                Select an entry to view its AI analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
