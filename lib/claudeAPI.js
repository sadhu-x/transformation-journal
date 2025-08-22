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
  let prompt = `## Context
I'm tracking my daily consciousness, emotions, and patterns for personal transformation using a custom journal app with Vedic astrology integration. I'd like you to analyze this data to identify patterns, insights, and recommendations for optimizing my growth, including cosmic influences and traditional Vedic remedies.

## Journal Entry to Analyze:
${entryContent}

## Analysis Goals
Please analyze for:
1. **Peak Performance Patterns**: When am I at my best? What conditions create optimal states?
2. **Discipline vs Surrender Balance**: How do structure and flow interact?
3. **Energy Patterns**: What activities/states give vs. drain energy?
4. **Transformation Indicators**: Signs of growth and areas needing attention
5. **Time-of-Day Insights**: When am I most clear, present, energized?
6. **Emotional Triggers**: What patterns emerge in my emotional states?
7. **Gratitude Impact**: How does gratitude correlate with other states?
8. **Challenge Response**: How do I handle difficulties and what helps?
9. **Cosmic Influences**: How do Vedic astrological factors correlate with my states and experiences?
10. **Lunar Cycle Patterns**: How do moon phases and tithis affect my energy and performance?
11. **Nakshatra Insights**: How do different lunar mansions influence my experiences?
12. **Cognitive Development Patterns**: How do different activities and states affect my mental clarity, problem-solving, and learning?
13. **Physical Strength Patterns**: How do exercise, movement, and physical activities correlate with my overall performance and energy?
14. **Creativity Patterns**: When am I most creative? What conditions foster innovative thinking and artistic expression?
15. **Wealth Building Patterns**: How do my activities, decisions, and states correlate with financial success and wealth creation?

## Vedic Astrology Analysis
Please consider:
- **Natal Chart Analysis**: How do my birth chart placements interact with current transits and cosmic influences?
- **Sun-Moon Relationship**: How do solar and lunar positions interact with my states?
- **Nakshatra Qualities**: Which lunar mansions support vs. challenge my goals?
- **Tithi Activities**: How do lunar days align with my practices and outcomes?
- **Elemental Balance**: How do Fire, Earth, Air, Water elements in cosmic positions affect me?
- **Dosha Analysis**: How do my birth chart doshas influence my current state and recommendations?

## Vedic Remedies & Practices
Please recommend specific practices based on cosmic context:
- **Mudras (Hand Gestures)**: Specific hand positions for balancing elements and energy
- **Acupressure Points**: Key pressure points for emotional and physical balance
- **Pranayama (Breathing)**: Breathing techniques for current cosmic influences
- **Herbs & Spices**: Traditional herbs and spices for balancing doshas and elements
- **Food Recommendations**: Specific foods, meals, and dietary practices aligned with current cosmic influences, doshas, and elemental balance
- **Aromatherapy & Fragrances**: Essential oils, incense, and fragrances for dosha balancing, planetary alignment, and energy purification
- **Gemstones**: Precious and semi-precious stones for planetary and elemental balance
- **Mantras**: Sacred sounds and chants for specific nakshatras and tithis
- **Yoga Asanas**: Postures that align with current cosmic energies
- **Meditation Techniques**: Practices suited to current lunar and solar positions

## Requested Output Format
Please provide analysis in this JSON format:
{
  "analysis": {
    "emotional_state": "Brief description of emotional state and spiritual insights",
    "key_themes": ["theme1", "theme2", "theme3"],
    "patterns": ["pattern1", "pattern2"],
    "insights": "Deep insights covering cognitive, physical, creative, and financial aspects revealed in this entry",
    "growth_areas": ["cognitive area", "physical area", "creative area", "financial area"],
    "strengths": ["cognitive strength", "physical strength", "creative strength", "financial strength"],
    "cosmic_influences": "How current cosmic energies and Vedic principles relate to this entry",
    "dosha_balance": "Insights about Vata, Pitta, Kapha balance reflected in this entry"
  },
  "remedies": [
    {
      "title": "Remedy title",
      "description": "Detailed description with specific instructions",
      "category": "mantras|gemstones|acupressure|meditations|service|mudras|pranayama|herbs|food|aromatherapy|yoga|cognitive|physical|creative|financial|vedic|mindfulness|action|reflection",
      "priority": "high|medium|low",
      "estimated_time": "5-10 minutes|15-30 minutes|1+ hours",
      "domain": "mental|physical|creative|financial|spiritual"
    }
  ],
  "prompts": [
    {
      "id": "prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}",
      "question": "Deep reflection question covering multiple domains",
      "category": "cognitive|physical|creative|financial|spiritual|integration",
      "difficulty": "easy|medium|challenging",
      "domain": "mental|physical|creative|financial|spiritual|multi-domain"
    }
  ]
}

## Guidelines:
1. **Be compassionate and non-judgmental** - The person is being vulnerable
2. **Focus on holistic transformation** - Address cognitive, physical, creative, and financial growth
3. **Provide actionable insights** - Give specific, practical guidance across all domains
4. **Acknowledge emotions while expanding scope** - Validate feelings and connect to broader potential
5. **Suggest varied remedies** - Mix cognitive exercises, physical practices, creative techniques, financial strategies, and Vedic wisdom
6. **Ask multi-dimensional questions** - Help them integrate insights across life domains
7. **Include traditional wisdom** - Incorporate Vedic principles, dosha balance, and cosmic awareness
8. **Consider elemental balance** - Address Fire (creativity/passion), Earth (stability/wealth), Air (mental clarity), Water (emotional flow)`

  // Add user profile context if available
  if (userProfile) {
    prompt += `

User Context:
- Goals: ${userProfile.primary_goals || 'Not specified'}
- Practices: ${userProfile.key_practices || 'Not specified'}
- Focus: ${userProfile.current_focus || 'Not specified'}`
    
    // Add birth chart data if available
    if (userProfile.birthDate && userProfile.birthTime && userProfile.birthLocation) {
      prompt += `
- Birth: ${userProfile.birthDate} ${userProfile.birthTime} ${userProfile.birthLocation}
- Dosha: ${userProfile.doshaBalance || 'Not specified'}`
    }
  }

  prompt += `

Respond with JSON only.`

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
