'use client'

import { useState } from 'react'
import { generateInstructionTemplate } from '../../lib/dataService'
import { getVedicData, formatVedicData } from '../../lib/astronomy'
import { Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Link, ExternalLink, Copy } from 'lucide-react'

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

export default function EntryList({ entries, onDeleteEntry, onEditEntry, title, collapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const [showTooltip, setShowTooltip] = useState({ discipline: false, surrender: false })
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [copyFeedback, setCopyFeedback] = useState(null)

  const copyEntryAsJson = async (entry) => {
    try {
      // Add cosmic context for the entry date
      const entryDate = new Date(entry.timestamp)
      const vedicData = getVedicData(entryDate)
      const formattedVedic = formatVedicData(vedicData)
      
      const entryWithCosmicContext = {
        ...entry,
        cosmicContext: {
          sun: formattedVedic.sun,
          moon: formattedVedic.moon,
          nakshatra: formattedVedic.nakshatra,
          tithi: formattedVedic.tithi,
          lunarPhase: formattedVedic.phase,
          yoga: vedicData.yoga.name,
          date: vedicData.date
        }
      }
      
      const entryJson = JSON.stringify(entryWithCosmicContext, null, 2)
      
      // Get user configuration for personalized instructions
      const userConfig = JSON.parse(localStorage.getItem('user-config') || '{}')
      const instructions = await generateInstructionTemplate(userConfig)
      
      // Get current non-negotiables for context
      const nonNegotiables = JSON.parse(localStorage.getItem('transformation-non-negotiables') || '[]')
      const nonNegotiablesJson = JSON.stringify(nonNegotiables, null, 2)
      
      const contextTemplate = `${instructions}

## Data Period
**Entry Date**: ${formatDate(entry.timestamp)} ${formatTime(entry.timestamp)}
**Entry ID**: ${entry.id}

---

## JOURNAL ENTRY DATA (with Cosmic Context):
\`\`\`json
${entryJson}
\`\`\`

---

## CURRENT NON-NEGOTIABLES:
\`\`\`json
${nonNegotiablesJson}
\`\`\`

---`

      // Create and download the file
      const blob = new Blob([contextTemplate], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `journal-entry-${formatDate(entry.timestamp).replace(/,/g, '')}-${entry.id}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Show success feedback
      setCopyFeedback('Downloaded!')
      setTimeout(() => setCopyFeedback(null), 2000)
      
      console.log('Entry downloaded successfully')
    } catch (error) {
      console.error('Failed to download entry:', error)
      setCopyFeedback('Download failed')
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  const handleTooltipEnter = (type, e) => {
    setShowTooltip(prev => ({ ...prev, [type]: true }))
  }

  const handleTooltipLeave = (type) => {
    setShowTooltip(prev => ({ ...prev, [type]: false }))
  }

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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Simple markdown renderer for display
  const renderMarkdown = (text) => {
    if (!text) return ''
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<div class="text-lg font-bold">$1</div>')
      .replace(/^## (.*$)/gm, '<div class="text-base font-semibold">$1</div>')
      .replace(/^- (.*$)/gm, '<div class="flex items-start"><span class="mr-2">•</span><span>$1</span></div>')
      .replace(/^(\d+)\. (.*$)/gm, '<div class="flex items-start"><span class="mr-2">$1.</span><span>$2</span></div>')
      .replace(/^> (.*$)/gm, '<div class="border-l-4 border-gray-300 pl-4 italic">$1</div>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-600 px-1 rounded text-sm">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>')
  }

  // Strip markdown formatting for plain text display
  const stripMarkdown = (text) => {
    if (!text) return ''
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/^#+\s*(.*$)/gm, '$1') // Remove headers
      .replace(/^[-*+]\s*(.*$)/gm, '$1') // Remove bullet points
      .replace(/^\d+\.\s*(.*$)/gm, '$1') // Remove numbered lists
      .replace(/^>\s*(.*$)/gm, '$1') // Remove blockquotes
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/\n+/g, ' ') // Replace multiple newlines with single space
      .trim()
  }

  if (entries.length === 0) return null

  return (
    <div className="space-y-4">
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
      {collapsed ? (
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            {isCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Entries: {entries.length}</span>
        </div>
      )}

      {!isCollapsed && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entry</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onEditEntry && onEditEntry(entry)}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="space-y-2">
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                      </div>
                      <div className="font-medium">
                        {entry.activity ? 
                          (() => {
                            const plainText = stripMarkdown(entry.activity)
                            return plainText.length > 100 ? 
                              `${plainText.substring(0, 100)}...` : 
                              plainText
                          })()
                        : 
                          'No activities recorded'
                        }
                      </div>
                      {entry.aiResponse && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 italic">
                          AI: {entry.aiResponse.length > 80 ? 
                            stripMarkdown(entry.aiResponse.substring(0, 80) + '...') : 
                            stripMarkdown(entry.aiResponse)
                          }
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                          onMouseEnter={(e) => handleTooltipEnter('discipline', e)}
                          onMouseLeave={() => handleTooltipLeave('discipline')}
                        >
                          {getScaleLabel(entry.tradingMindset, 'discipline')}
                        </span>
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300"
                          onMouseEnter={(e) => handleTooltipEnter('surrender', e)}
                          onMouseLeave={() => handleTooltipLeave('surrender')}
                        >
                          {getScaleLabel(entry.spiritualState, 'surrender')}
                        </span>
                      </div>
                      {showTooltip.discipline && (
                        <div
                          className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap"
                          style={{
                            left: '50%',
                            top: '25px',
                            transform: 'translateX(-50%)'
                          }}
                        >
                          {disciplineTooltips[entry.tradingMindset]}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                      {showTooltip.surrender && (
                        <div
                          className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap"
                          style={{
                            left: '50%',
                            top: '25px',
                            transform: 'translateX(-50%)'
                          }}
                        >
                          {surrenderTooltips[entry.spiritualState]}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering the row click
                          copyEntryAsJson(entry)
                        }}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="Copy as JSON"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering the row click
                          onDeleteEntry(entry.id)
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 