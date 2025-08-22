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

## About Me
- **Primary Goals**: ${userProfile?.primary_goals || 'Living my best life, optimizing performance for financial freedom, tantric and taoist practices'}
- **Key Practices**: ${userProfile?.key_practices || 'Daily meditation, advanced breath work, tantra, qi gong, magick'}
- **Current Focus**: ${userProfile?.current_focus || 'Mastery and Surrender'}

## Birth Data (for Vedic Astrology Analysis)
- **Birth Date**: ${userProfile?.birthDate || 'Not provided'}
- **Birth Time**: ${userProfile?.birthTime || 'Not provided'}
- **Birth Location**: ${userProfile?.birthLocation || 'Not provided'}
- **Birth Coordinates**: ${userProfile?.birthCoordinates || 'Not provided'}

## Natal Chart (Kundali) Analysis
${userProfile?.natalChart ? `
**Ascendant (Lagna)**: ${userProfile.natalChart.ascendant || 'Not provided'}

**Planetary Positions**:
${userProfile.natalChart.planets ? Object.entries(userProfile.natalChart.planets).map(([planet, data]) => `- ${planet}: ${data.sign} ${data.degree}° - ${data.nakshatra} (Pada ${data.pada}) - Lord: ${data.lord} - House ${data.house}`).join('\n') : 'Not provided'}

**Dosha Balance**:
- Vata: ${userProfile.natalChart.doshaBalance?.vata || 'Not specified'}%
- Pitta: ${userProfile.natalChart.doshaBalance?.pitta || 'Not specified'}%
- Kapha: ${userProfile.natalChart.doshaBalance?.kapha || 'Not specified'}%

**Houses**:
${userProfile.natalChart.houses ? Object.entries(userProfile.natalChart.houses).map(([house, data]) => `- House ${house}: ${data.sign} ${data.degree}° (Lord: ${data.lord})`).join('\n') : 'Not provided'}
` : 'Birth chart data not provided'}

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

## Cognitive Development & Intelligence Enhancement
Please analyze and provide:
- **Mental Clarity Indicators**: What activities, times, and conditions lead to peak mental performance?
- **Learning Optimization**: How can I structure my day for maximum knowledge absorption and retention?
- **Problem-Solving Patterns**: When am I best at solving complex problems? What conditions support analytical thinking?
- **Memory Enhancement**: What practices correlate with better memory and recall?
- **Focus & Concentration**: What helps me maintain deep focus and avoid distractions?
- **Cognitive Load Management**: How do I handle mental fatigue and information overload?
- **Mental Flexibility**: What practices help me adapt my thinking and see multiple perspectives?

## Physical Strength & Performance Enhancement
Please analyze and provide:
- **Energy Level Patterns**: What activities, foods, and practices correlate with high energy?
- **Recovery Patterns**: What helps me recover from physical and mental exertion?
- **Strength Building**: What types of exercise and movement correlate with feeling stronger?
- **Endurance Development**: What practices help me build stamina and persistence?
- **Physical Confidence**: What activities make me feel more physically capable and confident?
- **Movement Quality**: What types of movement feel most natural and beneficial?
- **Rest & Recovery**: What practices help me rest effectively and prevent burnout?

## Creativity & Innovation Enhancement
Please analyze and provide:
- **Creative Flow States**: When do I experience the most creative insights and flow?
- **Inspiration Sources**: What activities, environments, and experiences spark creativity?
- **Artistic Expression**: What conditions support artistic and expressive activities?
- **Innovation Patterns**: When am I most likely to generate novel ideas and solutions?
- **Creative Confidence**: What helps me feel more confident in my creative abilities?
- **Cross-Domain Thinking**: How can I apply insights from one area to another?
- **Creative Collaboration**: What conditions support creative collaboration and idea sharing?

## Wealth Building & Financial Intelligence Enhancement
Please analyze and provide:
- **Financial Decision Patterns**: When do I make my best financial decisions? What conditions support sound money choices?
- **Income Generation**: What activities, skills, and approaches correlate with increased income and earning potential?
- **Investment Intelligence**: What conditions help me make better investment and wealth-building decisions?
- **Risk Management**: How do I handle financial risk and uncertainty? What helps me make calculated risks?
- **Value Creation**: What activities help me create the most value for others and myself?
- **Financial Confidence**: What helps me feel more confident about money and financial decisions?
- **Wealth Mindset**: What practices and perspectives support a wealth-building mindset?
- **Opportunity Recognition**: When am I best at identifying and seizing financial opportunities?

## Vedic Astrology Analysis
Please consider:
- **Natal Chart Analysis**: How do my birth chart placements (if birth data provided) interact with current transits and cosmic influences?
- **Sun-Moon Relationship**: How do solar and lunar positions interact with my states?
- **Nakshatra Qualities**: Which lunar mansions support vs. challenge my goals?
- **Tithi Activities**: How do lunar days align with my practices and outcomes?
- **Elemental Balance**: How do Fire, Earth, Air, Water elements in cosmic positions affect me?
- **Dosha Analysis**: How do my birth chart doshas (if birth data provided) influence my current state and recommendations?
- **Aromatherapy Integration**: How do different essential oils and fragrances align with current cosmic influences and dosha balance?
- **Traditional Remedies**: What Vedic practices might support my transformation?

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

## Specific Questions
- "What's the relationship between my discipline and surrender scores?"
- "When do my biggest insights tend to occur?"
- "What patterns emerge in my gratitude vs. pain entries?"
- "How do my activities correlate with my state scores?"
- "How do different moon phases affect my energy and performance?"
- "Which nakshatras seem to support my best states?"
- "What tithis correlate with my most productive or insightful days?"
- "How do sun and moon positions relate to my discipline vs. surrender balance?"
- "What specific mudras or breathing techniques would support my current cosmic state?"
- "Which herbs or spices might help balance my current elemental influences?"
- "What foods and meals would be most beneficial for my current dosha balance and cosmic state?"
- "How do different foods affect my energy levels and mental clarity based on my patterns?"
- "What essential oils, incense, or fragrances would support my current dosha balance and cosmic state?"
- "How do different aromas and scents affect my energy, mood, and mental clarity?"
- "What gemstones would be most beneficial for my current planetary and elemental state?"
- "What acupressure points would be most beneficial for my current energy state?"
- "How do my natal chart placements (if birth data provided) influence my current patterns and states?"
- "What specific dosha-balancing practices would be most beneficial for my birth chart constitution?"

## Cognitive Development Questions & Exercises
- "What types of problems am I best at solving? When do I feel most mentally sharp?"
- "What learning methods work best for me? How do I retain information most effectively?"
- "When do I experience the most mental clarity and focus? What conditions support this?"
- "What activities help me think more clearly and solve complex problems?"
- "How do different types of mental work affect my energy and performance?"
- "What practices help me maintain concentration and avoid mental fatigue?"
- "When do I feel most mentally flexible and adaptable to new information?"
- "What types of challenges stretch my thinking and help me grow intellectually?"

## Physical Strength & Performance Questions & Exercises
- "What types of exercise make me feel strongest and most energized?"
- "When do I have the most physical energy and stamina?"
- "What activities help me build physical confidence and capability?"
- "How do different types of movement affect my overall performance and mood?"
- "What practices help me recover from physical and mental exertion?"
- "When do I feel most physically capable and confident?"
- "What types of physical challenges help me grow stronger?"
- "How do rest and recovery practices affect my physical performance?"

## Creativity & Innovation Questions & Exercises
- "When do I experience the most creative insights and flow states?"
- "What activities, environments, or experiences spark my creativity?"
- "What conditions help me generate novel ideas and solutions?"
- "When do I feel most confident in my creative abilities?"
- "What types of problems or challenges inspire my most creative thinking?"
- "How do I best apply insights from one domain to another?"
- "What conditions support artistic expression and creative collaboration?"
- "What practices help me overcome creative blocks and maintain creative momentum?"

## Wealth Building & Financial Intelligence Questions & Exercises
- "When do I make my best financial decisions? What conditions support sound money choices?"
- "What activities and skills correlate with increased income and earning potential?"
- "What conditions help me make better investment and wealth-building decisions?"
- "How do I handle financial risk and uncertainty? What helps me make calculated risks?"
- "What activities help me create the most value for others and myself?"
- "When do I feel most confident about money and financial decisions?"
- "What practices and perspectives support a wealth-building mindset?"
- "When am I best at identifying and seizing financial opportunities?"
- "What types of problems or challenges inspire my most innovative financial solutions?"
- "How do I best apply insights from other domains to wealth building?"
- "What conditions support financial collaboration and partnership opportunities?"
- "What practices help me overcome financial blocks and maintain wealth-building momentum?"

## Requested Output Format
Please provide analysis in this comprehensive JSON format:
{
  "executive_summary": {
    "key_insights": "2-3 key insights about this entry",
    "integrated_mastery": "Description of any integrated mastery states",
    "flow_architecture": "Analysis of systematic alignment patterns"
  },
  "detailed_analysis": {
    "natal_chart_integration": "How birth chart placements interact with current experience",
    "cosmic_influences": "Current cosmic influences and their impact",
    "cognitive_development": "Mental clarity, learning, problem-solving patterns",
    "physical_performance": "Energy, strength, recovery patterns",
    "creativity_innovation": "Creative flow, inspiration, innovation patterns",
    "wealth_building": "Financial decision, income, investment patterns"
  },
  "vedic_remedies": {
    "mudras": [
      {
        "name": "Mudra name",
        "instructions": "Specific hand position instructions",
        "timing": "When to practice",
        "benefits": "What it balances/enhances"
      }
    ],
    "pranayama": [
      {
        "name": "Breathing technique name",
        "instructions": "Specific breathing instructions",
        "duration": "How long to practice",
        "benefits": "What it enhances"
      }
    ],
    "gemstones": [
      {
        "name": "Gemstone name",
        "wearing_instructions": "How to wear",
        "timing": "When to wear",
        "benefits": "Planetary/elemental balance"
      }
    ],
    "aromatherapy": [
      {
        "name": "Essential oil/incense name",
        "application": "How to use",
        "timing": "When to use",
        "dosha_specific": "Dosha balancing effects"
      }
    ],
    "food_recommendations": [
      {
        "meal": "Specific food/meal",
        "timing": "When to consume",
        "preparation": "How to prepare",
        "benefits": "Dosha/cosmic alignment"
      }
    ]
  },
  "daily_challenges": {
    "cognitive": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "physical": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "creative": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "wealth_building": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "integration": ["Challenge 1", "Challenge 2"]
  },
  "pattern_recognition": {
    "primary_pattern": "Main pattern revealed in this entry",
    "investigation_questions": ["Question 1", "Question 2", "Question 3", "Question 4"]
  },
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
8. **Consider elemental balance** - Address Fire (creativity/passion), Earth (stability/wealth), Air (mental clarity), Water (emotional flow)
9. **Provide specific, actionable recommendations** - Give concrete practices, timings, and instructions
10. **Connect patterns across domains** - Show how different areas of life influence each other`

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
    
    // Handle new comprehensive format
    if (parsed.executive_summary || parsed.detailed_analysis || parsed.vedic_remedies || parsed.daily_challenges || parsed.pattern_recognition) {
      console.log('📋 Parsing comprehensive analysis format')
      return {
        analysis: {
          // Include new comprehensive sections
          executive_summary: parsed.executive_summary,
          detailed_analysis: parsed.detailed_analysis,
          vedic_remedies: parsed.vedic_remedies,
          daily_challenges: parsed.daily_challenges,
          pattern_recognition: parsed.pattern_recognition,
          // Include legacy fields for backward compatibility
          emotional_state: parsed.analysis?.emotional_state || 'Analysis completed',
          key_themes: parsed.analysis?.key_themes || [],
          patterns: parsed.analysis?.patterns || [],
          insights: parsed.analysis?.insights || 'Comprehensive analysis available',
          growth_areas: parsed.analysis?.growth_areas || [],
          strengths: parsed.analysis?.strengths || [],
          cosmic_influences: parsed.analysis?.cosmic_influences || '',
          dosha_balance: parsed.analysis?.dosha_balance || ''
        },
        remedies: Array.isArray(parsed.remedies) ? parsed.remedies : [],
        prompts: Array.isArray(parsed.prompts) ? parsed.prompts : []
      }
    }
    
    // Handle legacy format
    if (parsed.analysis && parsed.remedies && parsed.prompts) {
      console.log('📋 Parsing legacy analysis format')
      return {
        analysis: parsed.analysis,
        remedies: Array.isArray(parsed.remedies) ? parsed.remedies : [],
        prompts: Array.isArray(parsed.prompts) ? parsed.prompts : []
      }
    }

    throw new Error('Invalid response structure from Claude')

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
