'use client'

import { useState, useEffect } from 'react'
import { Brain, Lightbulb, Heart, Target, Clock, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

export default function AIAnalysis({ entry, onRefresh }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if entry has AI analysis
  const hasAnalysis = entry?.ai_analysis && Object.keys(entry.ai_analysis).length > 0
  const hasRemedies = entry?.ai_remedies && entry.ai_remedies.length > 0
  const hasPrompts = entry?.ai_prompts && entry.ai_prompts.length > 0

  const handleRefresh = async () => {
    if (!entry?.content) return
    
    setIsLoading(true)
    try {
      if (onRefresh) {
        await onRefresh(entry.content, entry.id)
      }
    } catch (error) {
      console.error('Error refreshing analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasAnalysis && !hasRemedies && !hasPrompts) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
          </h3>
          <Sparkles size={16} className="text-yellow-500" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh analysis"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Analysis Summary (Always visible) */}
      {hasAnalysis && (
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <Heart size={16} className="text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Emotional State
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {entry.ai_analysis.emotional_state}
              </p>
            </div>
          </div>

          {entry.ai_analysis.key_themes && entry.ai_analysis.key_themes.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Key Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {entry.ai_analysis.key_themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Detailed Analysis */}
          {hasAnalysis && (
            <div className="space-y-3">
              {entry.ai_analysis.insights && (
                <div className="flex items-start gap-3">
                  <Lightbulb size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Insights
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {entry.ai_analysis.insights}
                    </p>
                  </div>
                </div>
              )}

              {entry.ai_analysis.patterns && entry.ai_analysis.patterns.length > 0 && (
                <div className="flex items-start gap-3">
                  <Target size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Patterns
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {entry.ai_analysis.patterns.map((pattern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-500">•</span>
                          <span>{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {entry.ai_analysis.growth_areas && entry.ai_analysis.growth_areas.length > 0 && (
                <div className="flex items-start gap-3">
                  <Target size={16} className="text-green-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Growth Areas
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {entry.ai_analysis.growth_areas.map((area, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {entry.ai_analysis.strengths && entry.ai_analysis.strengths.length > 0 && (
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Strengths
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {entry.ai_analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remedies */}
          {hasRemedies && (
            <div className="border-t border-purple-200 dark:border-purple-800 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target size={16} className="text-green-500" />
                Suggested Practices
              </h4>
              <div className="space-y-3">
                {entry.ai_remedies.map((remedy, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {remedy.title}
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          remedy.priority === 'high' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
                            : remedy.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                        }`}>
                          {remedy.priority}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} />
                          <span>{remedy.estimated_time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {remedy.description}
                    </p>
                    {remedy.category && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {remedy.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection Prompts */}
          {hasPrompts && (
            <div className="border-t border-purple-200 dark:border-purple-800 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" />
                Reflection Questions
              </h4>
              <div className="space-y-3">
                {entry.ai_prompts.map((prompt, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {prompt.question}
                    </p>
                    <div className="flex items-center gap-2">
                      {prompt.category && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                          {prompt.category}
                        </span>
                      )}
                      {prompt.difficulty && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prompt.difficulty === 'challenging'
                            ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
                            : prompt.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                        }`}>
                          {prompt.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed Summary */}
      {!isExpanded && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {hasRemedies && (
            <span className="inline-block mr-3">
              {entry.ai_remedies.length} practice{entry.ai_remedies.length !== 1 ? 's' : ''} suggested
            </span>
          )}
          {hasPrompts && (
            <span className="inline-block">
              {entry.ai_prompts.length} reflection question{entry.ai_prompts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
