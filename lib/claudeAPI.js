// Claude API Service for Journal Entry Analysis
// Uses Anthropic's Claude API to analyze journal entries and provide insights

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022' // Using Claude 3 Sonnet for best performance/cost ratio

// Check if Claude API is available
const isClaudeAvailable = () => {
  console.log('🔍 Claude API Debug:', {
    hasKey: !!CLAUDE_API_KEY,
    keyLength: CLAUDE_API_KEY ? CLAUDE_API_KEY.length : 0,
    keyPrefix: CLAUDE_API_KEY ? CLAUDE_API_KEY.substring(0, 10) + '...' : 'none',
    envVars: Object.keys(process.env).filter(key => key.includes('CLAUDE'))
  })
  return CLAUDE_API_KEY !== undefined && CLAUDE_API_KEY !== null && CLAUDE_API_KEY !== ''
}

// Main function to analyze a journal entry
export const analyzeJournalEntry = async (entryContent, userProfile = null) => {
  if (!isClaudeAvailable()) {
    console.warn('Claude API key not configured. Skipping analysis.')
    return {
      success: false,
      error: 'Claude API not configured',
      analysis: null,
      remedies: [],
      prompts: []
    }
  }

  try {
    console.log('🤖 Starting Claude analysis of journal entry...')
    
    // Build the analysis prompt
    const analysisPrompt = buildAnalysisPrompt(entryContent, userProfile)
    
    // Call Claude API
    const response = await callClaudeAPI(analysisPrompt)
    
    if (!response.success) {
      return response
    }

    // Parse the Claude response
    const parsedResponse = parseClaudeResponse(response.data)
    
    console.log('✅ Claude analysis completed successfully')
    
    return {
      success: true,
      analysis: parsedResponse.analysis,
      remedies: parsedResponse.remedies,
      prompts: parsedResponse.prompts,
      rawResponse: response.data
    }

  } catch (error) {
    console.error('❌ Error in Claude analysis:', error)
    return {
      success: false,
      error: error.message,
      analysis: null,
      remedies: [],
      prompts: []
    }
  }
}

// Build the analysis prompt for Claude
const buildAnalysisPrompt = (entryContent, userProfile) => {
  let prompt = `Expert transformation analyst: Analyze this journal entry across cognitive, physical, creative, financial, spiritual, and Vedic domains.

Entry: ${entryContent}

Provide JSON analysis:
{
  "analysis": {
    "emotional_state": "Brief emotional/spiritual state",
    "key_themes": ["theme1", "theme2", "theme3"],
    "patterns": ["pattern1", "pattern2"],
    "insights": "Multi-domain insights from entry",
    "growth_areas": ["cognitive", "physical", "creative", "financial"],
    "strengths": ["cognitive", "physical", "creative", "financial"],
    "cosmic_influences": "Vedic/cosmic insights",
    "dosha_balance": "Vata/Pitta/Kapha balance"
  },
  "remedies": [
    {
      "title": "Title",
      "description": "Specific instructions",
      "category": "cognitive|physical|creative|financial|vedic|mindfulness|action|reflection",
      "priority": "high|medium|low",
      "estimated_time": "5-10min|15-30min|1+h",
      "domain": "mental|physical|creative|financial|spiritual"
    }
  ],
  "prompts": [
    {
      "id": "prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}",
      "question": "Multi-domain reflection question",
      "category": "cognitive|physical|creative|financial|spiritual|integration",
      "difficulty": "easy|medium|challenging",
      "domain": "mental|physical|creative|financial|spiritual|multi-domain"
    }
  ]
}

Guidelines: Compassionate, actionable, holistic, Vedic-aware, elemental balance (Fire/Earth/Air/Water).`

  // Add user profile context if available
  if (userProfile) {
    prompt += `
- Primary Goals: ${userProfile.primary_goals || 'Not specified'}
- Key Practices: ${userProfile.key_practices || 'Not specified'}
- Current Focus: ${userProfile.current_focus || 'Not specified'}`
  }

  prompt += `

Please respond with only the JSON object, no additional text or explanations.`

  return prompt
}

// Call the Claude API
const callClaudeAPI = async (prompt) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Claude API error:', response.status, errorData)
      return {
        success: false,
        error: `Claude API error: ${response.status} - ${errorData}`
      }
    }

    const data = await response.json()
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      return {
        success: false,
        error: 'Invalid response format from Claude API'
      }
    }

    return {
      success: true,
      data: data.content[0].text
    }

  } catch (error) {
    console.error('❌ Error calling Claude API:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Parse Claude's response into structured data
const parseClaudeResponse = (responseText) => {
  try {
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate the structure
    if (!parsed.analysis || !parsed.remedies || !parsed.prompts) {
      throw new Error('Invalid response structure from Claude')
    }

    return {
      analysis: parsed.analysis,
      remedies: Array.isArray(parsed.remedies) ? parsed.remedies : [],
      prompts: Array.isArray(parsed.prompts) ? parsed.prompts : []
    }

  } catch (error) {
    console.error('❌ Error parsing Claude response:', error)
    console.log('Raw response:', responseText)
    
    // Return a fallback response
    return {
      analysis: {
        emotional_state: 'Unable to analyze',
        key_themes: ['analysis_unavailable'],
        patterns: [],
        insights: 'Analysis temporarily unavailable',
        growth_areas: [],
        strengths: []
      },
      remedies: [],
      prompts: []
    }
  }
}

// Generate reflection prompts based on entry content
export const generateReflectionPrompts = async (entryContent, category = 'general') => {
  if (!isClaudeAvailable()) {
    return []
  }

  try {
    const prompt = `Based on this journal entry, generate 3-5 thoughtful reflection questions that would help the person go deeper in their self-reflection.

Journal Entry:
${entryContent}

Category: ${category}

Generate questions in this JSON format:
{
  "prompts": [
    {
      "question": "The reflection question",
      "category": "self-awareness|gratitude|growth|healing|relationships|purpose",
      "difficulty": "easy|medium|challenging"
    }
  ]
}

Focus on questions that:
- Encourage deeper self-awareness
- Help identify patterns and themes
- Support emotional processing
- Guide toward actionable insights
- Are specific to the content shared

Respond with only the JSON object.`

    const response = await callClaudeAPI(prompt)
    
    if (!response.success) {
      return []
    }

    const parsed = parseClaudeResponse(response.data)
    return parsed.prompts || []

  } catch (error) {
    console.error('❌ Error generating reflection prompts:', error)
    return []
  }
}

// Suggest remedies based on entry content
export const suggestRemedies = async (entryContent, userProfile = null) => {
  if (!isClaudeAvailable()) {
    return []
  }

  try {
    const prompt = `Based on this journal entry, suggest 3-5 practical remedies or practices that could help the person.

Journal Entry:
${entryContent}

Generate remedies in this JSON format:
{
  "remedies": [
    {
      "title": "Remedy title",
      "description": "Detailed description of what to do",
      "category": "mindfulness|action|reflection|practice|movement|connection",
      "priority": "high|medium|low",
      "estimated_time": "5-10 minutes|15-30 minutes|1+ hours"
    }
  ]
}

Focus on remedies that are:
- Practical and actionable
- Appropriate for the emotional state
- Varied in type and time commitment
- Supportive of growth and healing
- Specific to the challenges mentioned

Respond with only the JSON object.`

    const response = await callClaudeAPI(prompt)
    
    if (!response.success) {
      return []
    }

    const parsed = parseClaudeResponse(response.data)
    return parsed.remedies || []

  } catch (error) {
    console.error('❌ Error suggesting remedies:', error)
    return []
  }
}

// Test Claude API connection
export const testClaudeConnection = async () => {
  if (!isClaudeAvailable()) {
    return {
      success: false,
      error: 'Claude API key not configured'
    }
  }

  try {
    const testPrompt = `Please respond with a simple "Hello, Claude is working!" message.`
    
    const response = await callClaudeAPI(testPrompt)
    
    if (response.success) {
      return {
        success: true,
        message: 'Claude API connection successful'
      }
    } else {
      return {
        success: false,
        error: response.error
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Get Claude API status
export const getClaudeStatus = () => {
  return {
    available: isClaudeAvailable(),
    model: CLAUDE_MODEL,
    configured: !!CLAUDE_API_KEY
  }
}

// Analyze user response to a specific prompt for deeper insights
export const analyzeUserResponse = async (entryContent, promptQuestion, userResponse, userProfile = null) => {
  if (!isClaudeAvailable()) {
    console.warn('Claude API not available')
    return { success: false, error: 'Claude API not available' }
  }

  try {
    const analysisPrompt = buildResponseAnalysisPrompt(entryContent, promptQuestion, userResponse, userProfile)
    
    // Call Claude API
    const response = await callClaudeAPI(analysisPrompt)
    
    if (!response.success) {
      return response
    }

    // Parse the Claude response
    const parsedResponse = parseClaudeResponse(response.data)
    
    console.log('✅ User response analysis completed successfully')
    
    return {
      success: true,
      ai_followup: parsedResponse.ai_followup,
      rawResponse: response.data
    }

  } catch (error) {
    console.error('❌ Error in user response analysis:', error)
    return {
      success: false,
      error: error.message,
      ai_followup: null
    }
  }
}

// Build the analysis prompt for user responses
const buildResponseAnalysisPrompt = (entryContent, promptQuestion, userResponse, userProfile) => {
  let prompt = `Expert analyst: Deep dive analysis of user response to reflection question.

Original Entry: ${entryContent}
Question: ${promptQuestion}
Response: ${userResponse}

Provide JSON analysis:
{
  "ai_followup": "2-3 paragraphs: Connect to original entry, identify patterns, actionable insights, next steps, multi-domain perspective."
}

Guidelines: Compassionate, connect patterns, actionable, multi-domain (cognitive/physical/creative/financial/spiritual).`

  // Add user profile context if available
  if (userProfile) {
    prompt += `
- Primary Goals: ${userProfile.primary_goals || 'Not specified'}
- Key Practices: ${userProfile.key_practices || 'Not specified'}
- Current Focus: ${userProfile.current_focus || 'Not specified'}`
  }

  prompt += `

Please respond with only the JSON object, no additional text or explanations.`

  return prompt
}
