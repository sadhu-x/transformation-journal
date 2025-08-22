'use client'

import { useState } from 'react'
import { Brain, Lightbulb, Heart, Target, Clock, Sparkles, RefreshCw, MessageSquare, Send, ChevronDown, ChevronUp, Gem, HandHeart, Zap, Meditation, Users, Leaf, Apple, Flower } from 'lucide-react'

export default function AIAnalysis({ entry, onRefresh, onUpdateEntry }) {
  const [isLoading, setIsLoading] = useState(false)
  const [expandedPrompts, setExpandedPrompts] = useState({})
  const [responses, setResponses] = useState({})
  const [isSubmittingResponse, setIsSubmittingResponse] = useState({})

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

  const togglePromptExpansion = (promptId) => {
    setExpandedPrompts(prev => ({
      ...prev,
      [promptId]: !prev[promptId]
    }))
  }

  const handleResponseChange = (promptId, value) => {
    setResponses(prev => ({
      ...prev,
      [promptId]: value
    }))
  }

  const handleSubmitResponse = async (promptId) => {
    const response = responses[promptId]
    if (!response || !response.trim()) return

    setIsSubmittingResponse(prev => ({ ...prev, [promptId]: true }))
    
    try {
      // Update the prompt with user response
      const updatedPrompts = entry.ai_prompts.map(prompt => {
        if (prompt.id === promptId) {
          return {
            ...prompt,
            user_response: response,
            response_timestamp: new Date().toISOString()
          }
        }
        return prompt
      })

      // Update the entry with the new prompt data
      if (onUpdateEntry) {
        await onUpdateEntry({
          ...entry,
          ai_prompts: updatedPrompts
        })
      }

      // Clear the response input
      setResponses(prev => {
        const newResponses = { ...prev }
        delete newResponses[promptId]
        return newResponses
      })

      console.log('✅ Response submitted for prompt:', promptId)
    } catch (error) {
      console.error('❌ Error submitting response:', error)
    } finally {
      setIsSubmittingResponse(prev => ({ ...prev, [promptId]: false }))
    }
  }

  const handleDeepDive = async (promptId) => {
    const prompt = entry.ai_prompts.find(p => p.id === promptId)
    if (!prompt || !prompt.user_response) return

    setIsSubmittingResponse(prev => ({ ...prev, [promptId]: true }))
    
    try {
      // Trigger AI analysis of the response
      if (onRefresh) {
        await onRefresh(entry.content, entry.id, promptId, prompt.user_response)
      }
    } catch (error) {
      console.error('❌ Error in deep dive analysis:', error)
    } finally {
      setIsSubmittingResponse(prev => ({ ...prev, [promptId]: false }))
    }
  }

  // Get icon for remedy category
  const getRemedyIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'mantras':
        return <Sparkles size={14} className="text-purple-500" />
      case 'gemstones':
        return <Gem size={14} className="text-blue-500" />
      case 'acupressure':
        return <Zap size={14} className="text-yellow-500" />
      case 'meditations':
        return <Meditation size={14} className="text-green-500" />
      case 'service':
        return <Users size={14} className="text-orange-500" />
      case 'mudras':
        return <HandHeart size={14} className="text-pink-500" />
      case 'pranayama':
        return <Zap size={14} className="text-cyan-500" />
      case 'herbs':
        return <Leaf size={14} className="text-emerald-500" />
      case 'food':
        return <Apple size={14} className="text-red-500" />
      case 'aromatherapy':
        return <Flower size={14} className="text-indigo-500" />
      case 'yoga':
        return <Meditation size={14} className="text-teal-500" />
      default:
        return <Target size={14} className="text-gray-500" />
    }
  }

  // Get color for remedy category
  const getRemedyColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'mantras':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300'
      case 'gemstones':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
      case 'acupressure':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
      case 'meditations':
        return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
      case 'service':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300'
      case 'mudras':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-800 dark:text-pink-300'
      case 'pranayama':
        return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-800 dark:text-cyan-300'
      case 'herbs':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300'
      case 'food':
        return 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
      case 'aromatherapy':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300'
      case 'yoga':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (!hasAnalysis && !hasRemedies && !hasPrompts) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
          </h3>
          <Sparkles size={16} className="text-yellow-500" />
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh analysis"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Analysis Summary */}
      {hasAnalysis && (
        <div className="space-y-4">
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
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Key Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {entry.ai_analysis.key_themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

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
                      <span className="text-blue-500">•</span>
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

          {entry.ai_analysis.cosmic_influences && (
            <div className="flex items-start gap-3">
              <Brain size={16} className="text-purple-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Cosmic Influences
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {entry.ai_analysis.cosmic_influences}
                </p>
              </div>
            </div>
          )}

          {entry.ai_analysis.dosha_balance && (
            <div className="flex items-start gap-3">
              <Target size={16} className="text-orange-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Dosha Balance
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {entry.ai_analysis.dosha_balance}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Remedies */}
      {hasRemedies && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target size={16} className="text-green-500" />
            Suggested Remedies & Practices
          </h4>
          <div className="space-y-3">
            {entry.ai_remedies.map((remedy, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
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
                                    <div className="mt-2 flex gap-2">
                      {remedy.category && (
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getRemedyColor(remedy.category)}`}>
                          {getRemedyIcon(remedy.category)}
                          {remedy.category}
                        </span>
                      )}
                      {remedy.domain && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                          {remedy.domain}
                        </span>
                      )}
                    </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection Prompts */}
      {hasPrompts && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-500" />
            Interactive Reflection Questions
          </h4>
          <div className="space-y-3">
            {entry.ai_prompts.map((prompt, index) => {
              const promptId = prompt.id || `prompt_${index}`
              const isExpanded = expandedPrompts[promptId]
              const hasResponse = prompt.user_response
              const hasFollowup = prompt.ai_followup
              
              return (
                <div key={promptId} className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Prompt Header */}
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {prompt.question}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {prompt.category && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              {prompt.category}
                            </span>
                          )}
                          {prompt.domain && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                              {prompt.domain}
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
                      <button
                        type="button"
                        onClick={() => togglePromptExpansion(promptId)}
                        className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700">
                      {/* User Response Section */}
                      {hasResponse ? (
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Your Response</span>
                            {prompt.response_timestamp && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(prompt.response_timestamp).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {prompt.user_response}
                            </p>
                          </div>
                          
                          {/* AI Followup */}
                          {hasFollowup && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Brain size={14} className="text-purple-500" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">AI Deep Dive</span>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {prompt.ai_followup}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Deep Dive Button */}
                          {!hasFollowup && (
                            <button
                              type="button"
                              onClick={() => handleDeepDive(promptId)}
                              disabled={isSubmittingResponse[promptId]}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isSubmittingResponse[promptId] ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Brain size={14} />
                                  Deep Dive Analysis
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Response Input Section */
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Your Response</span>
                          </div>
                          <textarea
                            value={responses[promptId] || ''}
                            onChange={(e) => handleResponseChange(promptId, e.target.value)}
                            placeholder="Share your thoughts, insights, or experiences related to this question..."
                            rows={3}
                            className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSubmitResponse(promptId)}
                              disabled={!responses[promptId]?.trim() || isSubmittingResponse[promptId]}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isSubmittingResponse[promptId] ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Send size={14} />
                                  Submit Response
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
