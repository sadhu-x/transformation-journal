import { supabase } from './supabase'
import { getVedicData, formatVedicData } from './astronomy'
import { getApiAstroBirthChart } from './apiAstroAPI.js'

// Database table names
const TABLES = {
  ENTRIES: 'journal_entries',
  IMAGES: 'journal_images',
  NON_NEGOTIABLES: 'non_negotiables',
  BIRTH_CHART_DATA: 'birth_chart_data',
  BOOKS: 'books'
}

// Check if Supabase is available
const isSupabaseAvailable = () => {
  return supabase !== null
}



// Initialize database tables if they don't exist
export const initializeDatabase = async () => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, skipping database initialization')
    return
  }

  try {
    // Check if journal_entries table exists
    const { error: entriesError } = await supabase
      .from(TABLES.ENTRIES)
      .select('id')
      .limit(1)
    
    if (entriesError && entriesError.code === '42P01') {
      console.warn('Journal entries table does not exist. Please create it manually in your Supabase dashboard with the following SQL:')
      console.log(`
        CREATE TABLE journal_entries (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          timestamp TIMESTAMPTZ NOT NULL,
          content TEXT NOT NULL,
          attachments JSONB,
          ai_analysis JSONB,
          ai_remedies JSONB,
          ai_prompts JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
        CREATE INDEX idx_journal_entries_timestamp ON journal_entries(timestamp);
        
        -- Enable Row Level Security
        ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view their own entries" ON journal_entries
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own entries" ON journal_entries
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own entries" ON journal_entries
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own entries" ON journal_entries
          FOR DELETE USING (auth.uid() = user_id);
      `)
    } else if (entriesError) {
      console.warn('Error checking journal entries table:', entriesError)
    } else {
      console.log('Journal entries table exists and is accessible')
    }
  } catch (error) {
    console.warn('Database initialization warning:', error)
  }
}

// Entry operations
export const getEntries = async () => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return getLocalEntries()
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return getLocalEntries()
    }

    console.log('Fetching entries for user:', user.id)

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching entries:', error)
      if (error.code === '42703') {
        console.error('Database schema error: Missing columns. The journal_entries table exists but has incorrect columns.')
        console.log('Please run the following SQL to add missing columns:')
        console.log(`
          ALTER TABLE journal_entries 
          ADD COLUMN IF NOT EXISTS content TEXT NOT NULL,
          ADD COLUMN IF NOT EXISTS attachments JSONB,
          ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
          ADD COLUMN IF NOT EXISTS ai_remedies JSONB,
          ADD COLUMN IF NOT EXISTS ai_prompts JSONB;
        `)
      } else if (error.code === '42501') {
        console.error('Permission denied error. RLS policies might not be set up correctly.')
        console.log('Please run the following SQL to set up RLS policies:')
        console.log(`
          -- Enable Row Level Security
          ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
          
          -- Create RLS policies
          CREATE POLICY "Users can view their own entries" ON journal_entries
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert their own entries" ON journal_entries
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own entries" ON journal_entries
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can delete their own entries" ON journal_entries
            FOR DELETE USING (auth.uid() = user_id);
        `)
      }
      throw error
    }
    
    console.log('Successfully fetched', data?.length || 0, 'entries')
    return data || []
  } catch (error) {
    console.error('Error fetching entries:', error)
    return getLocalEntries()
  }
}

export const addEntry = async (entry) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    const newEntry = { ...entry, id: Date.now() }
    const localEntries = getLocalEntries()
    localEntries.unshift(newEntry)
    saveLocalEntries(localEntries)
    return newEntry
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Process attachments - upload images and get URLs
    const processedEntry = { 
      content: entry.content,
      attachments: entry.attachments || [],
      timestamp: entry.timestamp || new Date().toISOString(),
      user_id: user.id // Add user ID to entry
    }
    if (entry.attachments && entry.attachments.length > 0) {
      processedEntry.attachments = await Promise.all(
        entry.attachments.map(async (attachment) => {
          if (attachment.type === 'image' && attachment.data) {
            // Upload image to Supabase Storage
            const imageUrl = await uploadImage(attachment)
            return {
              ...attachment,
              data: imageUrl, // Replace base64 with URL
              localData: attachment.data // Keep local copy for immediate display
            }
          }
          return attachment
        })
      )
    }

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .insert([processedEntry])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding entry:', error)
    throw error
  }
}

export const updateEntry = async (id, updates) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    const localEntries = getLocalEntries()
    const updatedEntries = localEntries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    )
    saveLocalEntries(updatedEntries)
    return { ...localEntries.find(entry => entry.id === id), ...updates }
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating entry:', error)
    throw error
  }
}

export const deleteEntry = async (id) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    const localEntries = getLocalEntries()
    const filteredEntries = localEntries.filter(entry => entry.id !== id)
    saveLocalEntries(filteredEntries)
    return true
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Attempting to delete entry with ID:', id, 'for user:', user.id)

    // Get entry to find associated images
    const { data: entry, error: fetchError } = await supabase
      .from(TABLES.ENTRIES)
      .select('attachments')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching entry for deletion:', fetchError)
      if (fetchError.code === '42703') {
        throw new Error('Database schema error: Column not found. Please check if the journal_entries table exists with correct columns.')
      }
      throw fetchError
    }

    // Delete associated images from storage
    if (entry?.attachments) {
      await Promise.all(
        entry.attachments
          .filter(att => att.type === 'image')
          .map(att => deleteImage(att.data))
      )
    }

    const { error } = await supabase
      .from(TABLES.ENTRIES)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error in delete operation:', error)
      if (error.code === '42703') {
        throw new Error('Database schema error: Column not found. Please check if the journal_entries table exists with correct columns.')
      }
      throw error
    }
    
    console.log('Entry deleted successfully')
    return true
  } catch (error) {
    console.error('Error deleting entry:', error)
    throw error
  }
}

// Image operations
export const uploadImage = async (attachment) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, cannot upload image')
    return null
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const fileName = `${Date.now()}_${attachment.id}_${attachment.name}`
    const filePath = `${user.id}/${fileName}`

    // Convert base64 to blob
    const base64Data = attachment.data.split(',')[1]
    const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
      type: attachment.type || 'image/jpeg'
    })

    const { data, error } = await supabase.storage
      .from('journal-images')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get signed URL for private access
    const { data: { signedUrl } } = await supabase.storage
      .from('journal-images')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year expiry

    return signedUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('journal-images/')) return

    const filePath = imageUrl.split('journal-images/')[1]
    if (!filePath) return

    const { error } = await supabase.storage
      .from('journal-images')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

// Generate instruction template with user configuration
export const generateInstructionTemplate = async (userConfig = {}, natalChartData = null) => {
  const {
    primaryGoals = '[e.g., "Living my best life, optimizing trading performance, spiritual growth"]',
    keyPractices = '[e.g., "Daily meditation, breathwork, qigong, trading, FileMaker development"]',
    currentFocus = '[e.g., "Building system adherence in trading, deepening spiritual practices"]',
    birthDate = '[Not provided]',
    birthTime = '[Not provided]',
    birthLocation = '[Not provided]',
    birthLatitude = '[Not provided]',
    birthLongitude = '[Not provided]'
  } = userConfig

  // If natal chart data is provided, use it; otherwise calculate if birth data is available
  if (!natalChartData && birthDate && birthDate !== '[Not provided]' && birthDate.trim() !== '' &&
      birthTime && birthTime !== '[Not provided]' && birthTime.trim() !== '' &&
      birthLatitude && birthLatitude !== '[Not provided]' && birthLatitude.toString().trim() !== '' &&
      birthLongitude && birthLongitude !== '[Not provided]' && birthLongitude.toString().trim() !== '') {
    try {
      console.log('No natal chart data provided, calculating from birth data...')
      
      // First try to get stored birth chart data
      const storedChartData = await getBirthChartData(birthDate, birthTime, birthLatitude, birthLongitude)
      
      if (storedChartData && storedChartData.planets && storedChartData.planets.length > 0) {
        // Use stored data
        natalChartData = {
          ascendant: {
            rashi: storedChartData.ascendant_rashi,
            degree: storedChartData.ascendant_degree,
            nakshatra: storedChartData.ascendant_nakshatra
          },
          planets: storedChartData.planets,
          houses: storedChartData.houses
        }
        // Calculate doshas from stored data
        const doshas = calculateDoshas(natalChartData)
        natalChartData.doshas = doshas
        console.log('Using stored natal chart data:', natalChartData)
      } else {
        // Fallback to API if no stored data
        console.log('No stored birth chart data found, fetching from API Astro...')
        const apiNatalChart = await getApiAstroBirthChart(birthDate, birthTime, birthLatitude, birthLongitude)
        if (apiNatalChart && apiNatalChart.planets && apiNatalChart.planets.length > 0) {
          // Use API data
          natalChartData = apiNatalChart
          // Calculate doshas from API data
          const doshas = calculateDoshas(apiNatalChart)
          natalChartData.doshas = doshas
          console.log('Using Prokerala API natal chart data:', natalChartData)
        } else {
          console.warn('Prokerala API returned invalid data:', apiNatalChart)
        }
      }
    } catch (error) {
      console.error('Error calculating natal chart:', error)
    }
  }

  const prompt = `# Transformation Journal Data Analysis Request

## Context
I'm tracking my daily consciousness, emotions, and patterns for personal transformation using a custom journal app with Vedic astrology integration. I'd like you to analyze this data to identify patterns, insights, and recommendations for optimizing my growth, including cosmic influences and traditional Vedic remedies.

## About Me
- **Primary Goals**: ${primaryGoals}
- **Key Practices**: ${keyPractices}
- **Current Focus**: ${currentFocus}

## Birth Data (for Vedic Astrology Analysis)
- **Birth Date**: ${birthDate}
- **Birth Time**: ${birthTime}
- **Birth Location**: ${birthLocation}
- **Birth Coordinates**: ${birthLatitude}, ${birthLongitude}

${natalChartData ? `
## Natal Chart (Kundali) Analysis
**Ascendant (Lagna)**: ${natalChartData.ascendant.rashi} ${natalChartData.ascendant.degree || 0}° - ${natalChartData.ascendant.nakshatra}${natalChartData.ascendant.nakshatra_pada ? ` (Pada ${natalChartData.ascendant.nakshatra_pada})` : ''}${natalChartData.ascendant.nakshatra_lord ? ` - Lord: ${natalChartData.ascendant.nakshatra_lord}` : ''}

**Planetary Positions**:
${natalChartData.planets.map(p => `- ${p.planet}: ${p.rashi} ${p.degree || 0}°${p.isRetro ? ' (R)' : ''} - ${p.nakshatra}${p.nakshatra_pada ? ` (Pada ${p.nakshatra_pada})` : ''}${p.nakshatra_lord ? ` - Lord: ${p.nakshatra_lord}` : ''}${p.house ? ` - House ${p.house}` : ''}`).join('\n')}

${natalChartData.doshas ? `**Dosha Balance**:
- Vata: ${natalChartData.doshas.vata}%
- Pitta: ${natalChartData.doshas.pitta}%
- Kapha: ${natalChartData.doshas.kapha}%` : ''}

**Houses**:
${natalChartData.houses.map(h => `- House ${h.house}: ${h.rashi} ${h.degree || 0}° (Lord: ${h.lord})`).join('\n')}
` : '**Note**: Birth data incomplete - natal chart analysis not available'}

## Data Structure
Each entry contains:
- **Timestamp**: When the entry was made
- **Review of Activities**: What I was doing and reviewing
- **Discipline (0-6)**: No Structure → Masterful (system adherence, focus, willpower)
- **Surrender (0-6)**: Fighting → Fully Surrendered (flow, trust, letting go)
- **Gratitude and Love**: What I was grateful for and loving
- **Pain and Challenges**: Difficulties, discomfort, obstacles
- **Insights and Next Steps**: Realizations and action items
- **AI Response**: Responses from AI assistants (ChatGPT, Claude, etc.)
- **Attachments**: Images and links related to the entry
- **Cosmic Context**: Vedic astrology data for that day (Sun/Moon positions, Nakshatra, Tithi, Lunar Phase)

**Non-Negotiables Data** (separate from journal entries):
- **Text**: The non-negotiable item description
- **Completed**: Whether the item has been completed
- **Created At**: When the item was created
- **Completed At**: When the item was completed (if applicable)

## Vedic Astrology Context
Each entry includes cosmic data:
- **Sun Position**: Current zodiac sign and degree (represents soul, ego, vitality)
- **Moon Position**: Current zodiac sign and degree (represents mind, emotions, intuition)
- **Nakshatra**: Lunar mansion (27 divisions, each with specific deity, element, quality)
- **Tithi**: Lunar day (30 divisions, each with specific deity, nature, activities)
- **Lunar Phase**: Waxing/waning cycle (energy levels, manifestation vs. release)

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
9. **Non-Negotiables Patterns**: How do my non-negotiables relate to my overall state and progress?
10. **Cosmic Influences**: How do Vedic astrological factors correlate with my states and experiences?
11. **Lunar Cycle Patterns**: How do moon phases and tithis affect my energy and performance?
12. **Nakshatra Insights**: How do different lunar mansions influence my experiences?
13. **Dietary Patterns**: How do food choices and eating patterns affect my energy, clarity, and overall state?
14. **Aromatherapy Patterns**: How do different scents, essential oils, and fragrances affect my energy, mood, and mental states?
15. **Cognitive Development Patterns**: How do different activities and states affect my mental clarity, problem-solving, and learning?
16. **Physical Strength Patterns**: How do exercise, movement, and physical activities correlate with my overall performance and energy?
17. **Creativity Patterns**: When am I most creative? What conditions foster innovative thinking and artistic expression?
18. **Wealth Building Patterns**: How do my activities, decisions, and states correlate with financial success and wealth creation?

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
- "How do my non-negotiables completion rates relate to my overall state scores?"
- "What types of non-negotiables do I complete most consistently?"
- "How do my non-negotiables align with my primary goals and current focus?"
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
Please provide:
1. **Executive Summary**: 2-3 key insights about this entry
2. **Detailed Analysis**: Breakdown by categories above
3. **Cosmic Insights**: Vedic astrology correlations and patterns
4. **Natal Chart Analysis**: How your birth chart (if provided) relates to current patterns and recommendations
5. **Vedic Remedies**: Traditional practices that might support your goals
6. **Cognitive Development Practices**: 
   - **Mental Clarity Exercises**: Specific techniques for enhancing mental sharpness and focus
   - **Learning Optimization**: Strategies for maximum knowledge absorption and retention
   - **Problem-Solving Techniques**: Methods for approaching complex problems effectively
   - **Memory Enhancement**: Practices for improving memory and recall
   - **Concentration Exercises**: Techniques for maintaining deep focus and avoiding distractions
   - **Mental Flexibility Training**: Practices for adapting thinking and seeing multiple perspectives
   - **Cognitive Load Management**: Strategies for handling mental fatigue and information overload
7. **Physical Strength & Performance Practices**:
   - **Energy Optimization**: Activities and practices for maximizing physical energy
   - **Strength Building Exercises**: Specific movements and routines for building physical strength
   - **Recovery Protocols**: Practices for effective rest and recovery
   - **Endurance Development**: Methods for building stamina and persistence
   - **Movement Quality**: Techniques for improving movement patterns and physical confidence
   - **Rest & Recovery**: Specific practices for preventing burnout and maintaining performance
8. **Creativity & Innovation Practices**:
   - **Creative Flow Techniques**: Methods for accessing and maintaining creative flow states
   - **Inspiration Cultivation**: Practices for sparking creativity and generating ideas
   - **Artistic Expression**: Techniques for supporting artistic and expressive activities
   - **Innovation Methods**: Approaches for generating novel solutions and ideas
   - **Creative Confidence Building**: Practices for developing confidence in creative abilities
   - **Cross-Domain Thinking**: Techniques for applying insights across different domains
   - **Creative Collaboration**: Methods for effective creative collaboration and idea sharing
9. **Wealth Building & Financial Intelligence Practices**:
   - **Financial Decision Making**: Techniques for making sound financial decisions and choices
   - **Income Generation**: Strategies for increasing earning potential and income streams
   - **Investment Intelligence**: Methods for making better investment and wealth-building decisions
   - **Risk Management**: Practices for handling financial risk and making calculated risks
   - **Value Creation**: Techniques for creating maximum value for others and yourself
   - **Financial Confidence Building**: Practices for developing confidence in money decisions
   - **Wealth Mindset Cultivation**: Methods for developing a wealth-building mindset
   - **Opportunity Recognition**: Techniques for identifying and seizing financial opportunities
10. **Specific Practices**: 
   - **Mudras**: Recommended hand gestures with instructions
   - **Acupressure**: Key pressure points with application methods
   - **Pranayama**: Breathing techniques with timing and duration
   - **Herbs & Spices**: Specific recommendations with usage
   - **Food Recommendations**: Specific foods, meals, and dietary practices with timing and preparation methods
   - **Aromatherapy & Fragrances**: Essential oils, incense, and fragrances with application methods, timing, and dosha-specific recommendations
   - **Gemstones**: Recommended stones with wearing instructions and timing
   - **Mantras**: Sacred sounds for current cosmic influences
   - **Yoga Asanas**: Postures aligned with current energies
11. **Actionable Recommendations**: Specific changes to optimize my practices
12. **Pattern Recognition**: What patterns does this entry reveal?
13. **Questions for Deeper Investigation**: What should I track more closely?
14. **Daily Exercises & Challenges**: 
    - **Cognitive Challenges**: 2-3 specific mental exercises or problems to solve
    - **Physical Challenges**: 2-3 specific strength or movement exercises to try
    - **Creative Challenges**: 2-3 specific creative exercises or prompts to explore
    - **Wealth Building Challenges**: 2-3 specific financial exercises or opportunities to explore
    - **Integration Exercises**: 1-2 exercises that combine cognitive, physical, creative, and wealth-building elements`

  console.log('Generated prompt with natal chart data:', {
    hasNatalChart: !!natalChartData,
    natalChartData: natalChartData,
    doshas: natalChartData?.doshas
  })

  return prompt
}

// Calculate doshas from natal chart data
function calculateDoshas(natalChart) {
  try {
    // Simple dosha calculation based on planetary positions
    // This is a basic implementation - you might want to enhance it
    
    let vata = 0
    let pitta = 0
    let kapha = 0
    
    if (natalChart.planets) {
      natalChart.planets.forEach(planet => {
        const rashi = planet.rashi?.toLowerCase()
        
        // Vata signs: Gemini, Virgo, Libra, Capricorn, Aquarius
        if (['gemini', 'virgo', 'libra', 'capricorn', 'aquarius'].includes(rashi)) {
          vata += 1
        }
        // Pitta signs: Aries, Leo, Sagittarius
        else if (['aries', 'leo', 'sagittarius'].includes(rashi)) {
          pitta += 1
        }
        // Kapha signs: Taurus, Cancer, Scorpio, Pisces
        else if (['taurus', 'cancer', 'scorpio', 'pisces'].includes(rashi)) {
          kapha += 1
        }
      })
    }
    
    // Calculate percentages
    const total = vata + pitta + kapha
    if (total > 0) {
      vata = Math.round((vata / total) * 100)
      pitta = Math.round((pitta / total) * 100)
      kapha = Math.round((kapha / total) * 100)
    } else {
      // Default balanced dosha if no planets found
      vata = 33
      pitta = 33
      kapha = 34
    }
    
    return { vata, pitta, kapha }
  } catch (error) {
    console.error('Error calculating doshas:', error)
    return { vata: 33, pitta: 33, kapha: 34 }
  }
}

// Backup and restore operations
export const exportData = async (dateFilter = null) => {
  try {
    const [entries, nonNegotiables] = await Promise.all([
      getEntries(),
      dateFilter ? getNonNegotiables(dateFilter) : getNonNegotiables()
    ])
    
    // Get user configuration
    const userConfig = JSON.parse(localStorage.getItem('user-config') || '{}')
    
    // Convert image URLs back to base64 for export and add cosmic context
    const exportData = await Promise.all(
      entries.map(async (entry) => {
        // Add cosmic context for the entry date
        const entryDate = new Date(entry.timestamp)
        const vedicData = getVedicData(entryDate)
        const formattedVedic = formatVedicData(vedicData)
        
        // Process attachments if they exist
        let processedAttachments = entry.attachments
        if (entry.attachments) {
          processedAttachments = await Promise.all(
            entry.attachments.map(async (attachment) => {
              if (attachment.type === 'image' && attachment.data && attachment.data.startsWith('http')) {
                try {
                  // Download image and convert to base64
                  const response = await fetch(attachment.data)
                  const blob = await response.blob()
                  const base64 = await blobToBase64(blob)
                  return {
                    ...attachment,
                    data: base64
                  }
                } catch (error) {
                  console.warn('Could not convert image to base64:', error)
                  return attachment
                }
              }
              return attachment
            })
          )
        }
        
        return { 
          ...entry, 
          attachments: processedAttachments,
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
      })
    )

    // Get user profile and fetch enhanced birth chart data
    let natalChartData = null
    try {
      const userProfile = await getUserProfile()
      if (userProfile && userProfile.birth_date && userProfile.birth_time && 
          userProfile.birth_latitude && userProfile.birth_longitude) {
        
        console.log('Fetching enhanced birth chart data for export...')
        
        // First try to get stored enhanced birth chart data
        const storedChartData = await getBirthChartData(
          userProfile.birth_date, 
          userProfile.birth_time, 
          userProfile.birth_latitude, 
          userProfile.birth_longitude
        )
        
        if (storedChartData && storedChartData.planets && storedChartData.planets.length > 0) {
          // Use stored enhanced data
          natalChartData = {
            ascendant: {
              rashi: storedChartData.ascendant_rashi,
              degree: storedChartData.ascendant_degree,
              nakshatra: storedChartData.ascendant_nakshatra,
              longitude: storedChartData.ascendant_longitude,
              longitude_dms: storedChartData.ascendant_longitude_dms,
              sign_degree_dms: storedChartData.ascendant_sign_degree_dms
            },
            planets: storedChartData.planets,
            houses: storedChartData.houses
          }
          console.log('Using stored enhanced birth chart data for export:', natalChartData)
        } else {
          // Fallback: try to fetch fresh data from API
          console.log('No stored birth chart data found, fetching from API...')
          const result = await fetchAndStoreBirthChart(
            userProfile.birth_date, 
            userProfile.birth_time, 
            userProfile.birth_latitude, 
            userProfile.birth_longitude
          )
          
          if (result.success && result.data) {
            natalChartData = {
              ascendant: {
                rashi: result.data.ascendant_rashi,
                degree: result.data.ascendant_degree,
                nakshatra: result.data.ascendant_nakshatra,
                longitude: result.data.ascendant_longitude,
                longitude_dms: result.data.ascendant_longitude_dms,
                sign_degree_dms: result.data.ascendant_sign_degree_dms
              },
              planets: result.data.planets,
              houses: result.data.houses
            }
            console.log('Using fresh API birth chart data for export:', natalChartData)
          } else {
            console.warn('Failed to fetch birth chart data for export:', result.error)
          }
        }
        
        // Calculate doshas if we have natal chart data
        if (natalChartData) {
          const doshas = calculateDoshas(natalChartData)
          natalChartData.doshas = doshas
          console.log('Calculated doshas for export:', doshas)
        }
      }
    } catch (error) {
      console.error('Error fetching birth chart data for export:', error)
    }

    // Include instructions and metadata in the export
    const exportPackage = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalEntries: exportData.length,
        totalNonNegotiables: nonNegotiables.length,
        userConfig: userConfig
      },
      instructions: await generateInstructionTemplate(userConfig, natalChartData),
      data: exportData,
      nonNegotiables: nonNegotiables,
      natalChart: natalChartData
    }

    return exportPackage
  } catch (error) {
    console.error('Error exporting data:', error)
    throw error
  }
}

export const importData = async (data) => {
  try {
    // Handle both old format (just entries) and new format (with non-negotiables)
    const entries = Array.isArray(data) ? data : data.data || []
    const nonNegotiables = data.nonNegotiables || []

    // Clear existing data
    const [deleteEntriesError, deleteNonNegotiablesError] = await Promise.all([
      supabase.from(TABLES.ENTRIES).delete().neq('id', 0),
      supabase.from(TABLES.NON_NEGOTIABLES).delete().neq('id', 0)
    ])

    if (deleteEntriesError) throw deleteEntriesError
    if (deleteNonNegotiablesError) throw deleteNonNegotiablesError

    // Import new data
    const [importedEntries, importedNonNegotiables] = await Promise.all([
      Promise.all(entries.map(entry => addEntry(entry))),
      Promise.all(nonNegotiables.map(item => addNonNegotiable(item)))
    ])

    return {
      entries: importedEntries,
      nonNegotiables: importedNonNegotiables
    }
  } catch (error) {
    console.error('Error importing data:', error)
    throw error
  }
}

// Utility functions
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
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

// Non-negotiables operations
export const getNonNegotiables = async (date = null) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return getLocalNonNegotiables()
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return getLocalNonNegotiables()
    }

    let query = supabase
      .from(TABLES.NON_NEGOTIABLES)
      .select('*')
      .eq('user_id', user.id)

    // If date is specified, filter by date
    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching non-negotiables:', error)
      return getLocalNonNegotiables()
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching non-negotiables:', error)
    return getLocalNonNegotiables()
  }
}

export const addNonNegotiable = async (item) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    const newItem = { ...item, id: Date.now() }
    const localItems = getLocalNonNegotiables()
    localItems.unshift(newItem)
    saveLocalNonNegotiables(localItems)
    return newItem
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Ensure date is set in local timezone
    const getLocalDate = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const itemWithDate = {
      ...item,
      user_id: user.id,
      date: item.date || getLocalDate()
    }

    const { data, error } = await supabase
      .from(TABLES.NON_NEGOTIABLES)
      .insert([itemWithDate])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding non-negotiable:', error)
    throw error
  }
}

export const updateNonNegotiable = async (id, updates) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    const localItems = getLocalNonNegotiables()
    const updatedItems = localItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    saveLocalNonNegotiables(updatedItems)
    return { ...localItems.find(item => item.id === id), ...updates }
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.NON_NEGOTIABLES)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating non-negotiable:', error)
    throw error
  }
}

export const deleteNonNegotiable = async (id) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    const localItems = getLocalNonNegotiables()
    const filteredItems = localItems.filter(item => item.id !== id)
    saveLocalNonNegotiables(filteredItems)
    return true
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from(TABLES.NON_NEGOTIABLES)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting non-negotiable:', error)
    throw error
  }
}

// Get non-negotiables for a specific date range (for repeat functionality)
export const getNonNegotiablesForDateRange = async (startDate, endDate) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return getLocalNonNegotiables()
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return getLocalNonNegotiables()
    }

    const { data, error } = await supabase
      .from(TABLES.NON_NEGOTIABLES)
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching non-negotiables for date range:', error)
      return getLocalNonNegotiables()
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching non-negotiables for date range:', error)
    return getLocalNonNegotiables()
  }
}

// Get daily repeating non-negotiables that should appear on a specific date
export const getDailyRepeatingNonNegotiables = async (targetDate) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return []
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return []
    }

    // Get all daily repeating non-negotiables that were created before or on the target date
    const { data, error } = await supabase
      .from(TABLES.NON_NEGOTIABLES)
      .select('*')
      .eq('user_id', user.id)
      .eq('repeat_type', 'daily')
      .lte('date', targetDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching daily repeating non-negotiables:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching daily repeating non-negotiables:', error)
    return []
  }
}

// Copy daily repeating non-negotiables to a specific date
export const copyDailyRepeatingNonNegotiables = async (targetDate) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return []
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get all daily repeating non-negotiables that should appear on this date
    const repeatingItems = await getDailyRepeatingNonNegotiables(targetDate)
    
    if (repeatingItems.length === 0) {
      return []
    }

    // Check which ones don't already exist for the target date
    const existingItems = await getNonNegotiables(targetDate)
    const existingTexts = existingItems.map(item => item.text)
    
    const itemsToCopy = repeatingItems.filter(item => 
      !existingTexts.includes(item.text)
    )

    if (itemsToCopy.length === 0) {
      return []
    }

    // Copy the items to the target date
    const copyPromises = itemsToCopy.map(async (item) => {
      const newItem = {
        text: item.text,
        completed: false,
        created_at: new Date().toISOString(),
        completed_at: null,
        date: targetDate,
        repeat_type: 'daily'
      }
      
      return await addNonNegotiable(newItem)
    })

    const copiedItems = await Promise.all(copyPromises)
    return copiedItems
  } catch (error) {
    console.error('Error copying daily repeating non-negotiables:', error)
    throw error
  }
}

// Local storage fallback for non-negotiables
export const getLocalNonNegotiables = () => {
  try {
    const saved = localStorage.getItem('transformation-non-negotiables')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error reading non-negotiables from localStorage:', error)
    return []
  }
}

export const saveLocalNonNegotiables = (items) => {
  try {
    localStorage.setItem('transformation-non-negotiables', JSON.stringify(items))
  } catch (error) {
    console.error('Error saving non-negotiables to localStorage:', error)
  }
}

// Local storage fallback for offline functionality
export const getLocalEntries = () => {
  try {
    const saved = localStorage.getItem('transformation-entries')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old data')
      try {
        localStorage.clear()
        return []
      } catch (clearError) {
        console.error('Failed to clear localStorage:', clearError)
        return []
      }
    }
    return []
  }
}

export const saveLocalEntries = (entries) => {
  try {
    // Try to save the full data first
    localStorage.setItem('transformation-entries', JSON.stringify(entries))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting to save without images')
      try {
        // Remove image data to save space
        const entriesWithoutImages = entries.map(entry => ({
          ...entry,
          attachments: entry.attachments ? entry.attachments.map(att => {
            if (att.type === 'image') {
              return {
                ...att,
                data: null, // Remove base64 image data
                name: att.name || 'Image',
                size: att.size
              }
            }
            return att
          }) : []
        }))
        
        localStorage.setItem('transformation-entries', JSON.stringify(entriesWithoutImages))
        console.warn('Saved entries without image data due to storage limits')
      } catch (retryError) {
        console.error('Failed to save even without images:', retryError)
        // Last resort: clear everything and save minimal data
        try {
          localStorage.clear()
          const minimalEntries = entries.map(entry => ({
            id: entry.id,
            timestamp: entry.timestamp,
            content: entry.content || '',
            attachments: [] // Remove all attachments
          }))
          localStorage.setItem('transformation-entries', JSON.stringify(minimalEntries))
          console.warn('Saved minimal entry data (no attachments) due to storage limits')
        } catch (finalError) {
          console.error('Failed to save any data to localStorage:', finalError)
        }
      }
    }
  }
}

// User Profile Functions
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export const updateUserProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // First try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing profile:', fetchError)
    }

    // If profile exists, update it; otherwise insert
    const operation = existingProfile ? 'update' : 'insert'
    
    let result
    if (operation === 'update') {
      result = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return result.data
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export const createUserProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        ...profileData
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

// Birth Chart Data Functions
export const getBirthChartData = async (birthDate, birthTime, birthLatitude, birthLongitude) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from(TABLES.BIRTH_CHART_DATA)
      .select('*')
      .eq('user_id', user.id)
      .eq('birth_date', birthDate)
      .eq('birth_time', birthTime)
      .eq('birth_latitude', birthLatitude)
      .eq('birth_longitude', birthLongitude)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching birth chart data:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getBirthChartData:', error)
    return null
  }
}

export const saveBirthChartData = async (birthDate, birthTime, birthLatitude, birthLongitude, chartData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    console.log('Saving birth chart data for user:', user.id)
    console.log('Birth data:', { birthDate, birthTime, birthLatitude, birthLongitude })
    console.log('Chart data to save:', chartData)

    // Enhanced birth chart record with additional fields
    const birthChartRecord = {
      user_id: user.id,
      birth_date: birthDate,
      birth_time: birthTime,
      birth_latitude: parseFloat(birthLatitude),
      birth_longitude: parseFloat(birthLongitude),
      ascendant_rashi: chartData.ascendant?.rashi || null,
      ascendant_degree: chartData.ascendant?.degree || null,
      ascendant_nakshatra: chartData.ascendant?.nakshatra || null,
      ascendant_nakshatra_pada: chartData.ascendant?.nakshatra_pada || null,
      ascendant_nakshatra_lord: chartData.ascendant?.nakshatra_lord || null,
      ascendant_sign_lord: chartData.ascendant?.sign_lord || null,
      ascendant_longitude: chartData.ascendant?.longitude || null,
      ascendant_longitude_dms: chartData.ascendant?.longitude_dms || null,
      ascendant_sign_degree_dms: chartData.ascendant?.sign_degree_dms || null,
      planets: chartData.planets || [],
      houses: chartData.houses || [],
      raw_api_response: chartData.raw_response || null, // Store original API response for debugging
      calculated_at: new Date().toISOString()
    }

    console.log('Birth chart record to save:', birthChartRecord)

    const { data, error } = await supabase
      .from(TABLES.BIRTH_CHART_DATA)
      .upsert(birthChartRecord, {
        onConflict: 'user_id,birth_date,birth_time,birth_latitude,birth_longitude'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Successfully saved birth chart data to Supabase:', data)
    return data
  } catch (error) {
    console.error('Error saving birth chart data:', error)
    throw error
  }
}

export const fetchAndStoreBirthChart = async (birthDate, birthTime, birthLatitude, birthLongitude, forceRecalculate = false) => {
  try {
    console.log('=== Starting birth chart fetch and store ===')
    console.log('Input parameters:', { birthDate, birthTime, birthLatitude, birthLongitude, forceRecalculate })
    
    // First check if we already have this birth chart data (unless forcing recalculation)
    if (!forceRecalculate) {
      const existingData = await getBirthChartData(birthDate, birthTime, birthLatitude, birthLongitude)
      if (existingData) {
        console.log('✅ Birth chart data already exists in database:', existingData)
        return {
          success: true,
          data: existingData,
          cached: true
        }
      }
    } else {
      console.log('🔄 Force recalculation requested, skipping cache check')
    }

    // Fetch new birth chart data from API Astro
    console.log('🔄 Fetching birth chart data from API Astro...')
    const chartData = await getApiAstroBirthChart(birthDate, birthTime, birthLatitude, birthLongitude)
    
    console.log('📊 API returned chart data:', chartData)
    
    if (!chartData || !chartData.planets || chartData.planets.length === 0) {
      console.error('❌ Invalid birth chart data received from API')
      throw new Error('Invalid birth chart data received from API')
    }

    // Save the birth chart data to Supabase
    console.log('💾 Saving birth chart data to Supabase...')
    const savedData = await saveBirthChartData(birthDate, birthTime, birthLatitude, birthLongitude, chartData)
    
    console.log('✅ Successfully saved birth chart data:', savedData)
    
    return {
      success: true,
      data: savedData,
      cached: false
    }
  } catch (error) {
    console.error('❌ Error in fetchAndStoreBirthChart:', error)
    return {
      success: false,
      error: error.message,
      data: null,
      cached: false
    }
  }
}

// Function to force recalculation of birth chart data
export const forceRecalculateBirthChart = async (birthDate, birthTime, birthLatitude, birthLongitude) => {
  return await fetchAndStoreBirthChart(birthDate, birthTime, birthLatitude, birthLongitude, true)
}

// Function to check all birth chart data for the current user
export const debugBirthChartData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ No authenticated user')
      return
    }

    console.log('=== Debugging Birth Chart Data ===')
    console.log('Current user ID:', user.id)

    // Check all birth chart data for this user
    const { data, error } = await supabase
      .from(TABLES.BIRTH_CHART_DATA)
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Error fetching birth chart data:', error)
      return
    }

    console.log('📊 All birth chart records for user:', data)
    console.log('📈 Total records found:', data?.length || 0)

    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          birth_date: record.birth_date,
          birth_time: record.birth_time,
          birth_latitude: record.birth_latitude,
          birth_longitude: record.birth_longitude,
          ascendant_rashi: record.ascendant_rashi,
          ascendant_degree: record.ascendant_degree,
          ascendant_nakshatra: record.ascendant_nakshatra,
          ascendant_longitude: record.ascendant_longitude,
          ascendant_longitude_dms: record.ascendant_longitude_dms,
          ascendant_sign_degree_dms: record.ascendant_sign_degree_dms,
          planets_count: record.planets?.length || 0,
          houses_count: record.houses?.length || 0,
          has_raw_response: !!record.raw_api_response,
          calculated_at: record.calculated_at
        })
      })
    } else {
      console.log('📭 No birth chart data found for this user')
    }

    console.log('=====================================')
  } catch (error) {
    console.error('❌ Error in debugBirthChartData:', error)
  }
}

// Function to validate and test birth chart data format
export const validateBirthChartData = (chartData) => {
  try {
    console.log('=== Validating Birth Chart Data ===')
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {}
    }
    
    // Check ascendant data
    if (!chartData.ascendant) {
      validation.errors.push('Missing ascendant data')
      validation.isValid = false
    } else {
      validation.summary.ascendant = {
        rashi: chartData.ascendant.rashi,
        degree: chartData.ascendant.degree,
        nakshatra: chartData.ascendant.nakshatra,
        longitude: chartData.ascendant.longitude,
        longitude_dms: chartData.ascendant.longitude_dms
      }
    }
    
    // Check planets data
    if (!chartData.planets || !Array.isArray(chartData.planets)) {
      validation.errors.push('Missing or invalid planets data')
      validation.isValid = false
    } else {
      validation.summary.planets = {
        count: chartData.planets.length,
        planets: chartData.planets.map(p => ({
          planet: p.planet,
          rashi: p.rashi,
          degree: p.degree,
          nakshatra: p.nakshatra,
          house: p.house
        }))
      }
      
      // Check for required planets
      const requiredPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
      const foundPlanets = chartData.planets.map(p => p.planet)
      const missingPlanets = requiredPlanets.filter(p => !foundPlanets.includes(p))
      
      if (missingPlanets.length > 0) {
        validation.warnings.push(`Missing planets: ${missingPlanets.join(', ')}`)
      }
    }
    
    // Check houses data
    if (!chartData.houses || !Array.isArray(chartData.houses)) {
      validation.warnings.push('Missing or invalid houses data')
    } else {
      validation.summary.houses = {
        count: chartData.houses.length,
        houses: chartData.houses.map(h => ({
          house: h.house,
          rashi: h.rashi,
          degree: h.degree,
          lord: h.lord
        }))
      }
    }
    
    // Check raw response
    if (chartData.raw_response) {
      validation.summary.hasRawResponse = true
      validation.summary.rawResponseKeys = Object.keys(chartData.raw_response)
    } else {
      validation.warnings.push('No raw API response stored')
    }
    
    console.log('Validation result:', validation)
    return validation
    
  } catch (error) {
    console.error('Error validating birth chart data:', error)
    return {
      isValid: false,
      errors: ['Validation error: ' + error.message],
      warnings: [],
      summary: {}
    }
  }
} 

// ===== BOOK MANAGEMENT FUNCTIONS =====

// Get all books for the current user
export const getBooks = async () => {
  console.log('getBooks called')
  
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return getLocalBooks()
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('getBooks auth check:', { user: user?.id, authError })
    
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return getLocalBooks()
    }

    console.log('Fetching books for user:', user.id)

    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })

    console.log('getBooks Supabase result:', { data: data?.length, error })

    if (error) {
      console.error('Error fetching books:', error)
      return getLocalBooks()
    }

    console.log('Books loaded from Supabase:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Error in getBooks:', error)
    return getLocalBooks()
  }
}

// Add a new book
export const addBook = async (book) => {
  console.log('addBook called with:', book)
  
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return addLocalBook(book)
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check result:', { user: user?.id, authError })
    
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return addLocalBook(book)
    }

    const bookData = {
      user_id: user.id,
      title: book.title,
      author: book.author,
      category: book.category,
      priority: book.priority,
      status: book.status,
      notes: book.notes || null
    }
    
    console.log('Inserting book data:', bookData)

    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .insert([bookData])
      .select()

    console.log('Supabase insert result:', { data, error })

    if (error) {
      console.error('Error adding book:', error)
      return addLocalBook(book)
    }

    console.log('Book added successfully to Supabase:', data[0])
    return data[0]
  } catch (error) {
    console.error('Error in addBook:', error)
    return addLocalBook(book)
  }
}

// Update a book
export const updateBook = async (id, updates) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return updateLocalBook(id, updates)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return updateLocalBook(id, updates)
    }

    // Add completed_at timestamp if status is being set to completed
    const updateData = { ...updates }
    if (updates.status === 'completed' && !updates.completed_at) {
      updateData.completed_at = new Date().toISOString()
    } else if (updates.status !== 'completed') {
      updateData.completed_at = null
    }

    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Error updating book:', error)
      return updateLocalBook(id, updates)
    }

    return data[0]
  } catch (error) {
    console.error('Error in updateBook:', error)
    return updateLocalBook(id, updates)
  }
}

// Delete a book
export const deleteBook = async (id) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using localStorage')
    return deleteLocalBook(id)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, using localStorage')
      return deleteLocalBook(id)
    }

    const { error } = await supabase
      .from(TABLES.BOOKS)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting book:', error)
      return deleteLocalBook(id)
    }

    return true
  } catch (error) {
    console.error('Error in deleteBook:', error)
    return deleteLocalBook(id)
  }
}

// ===== LOCAL STORAGE FALLBACK FUNCTIONS =====

// Get books from localStorage
const getLocalBooks = () => {
  try {
    const savedBooks = localStorage.getItem('userBooks')
    return savedBooks ? JSON.parse(savedBooks) : []
  } catch (error) {
    console.error('Error reading books from localStorage:', error)
    return []
  }
}

// Add book to localStorage
const addLocalBook = (book) => {
  try {
    const books = getLocalBooks()
    const newBook = {
      ...book,
      id: Date.now(),
      added_at: new Date().toISOString(),
      user_id: 'local'
    }
    const updatedBooks = [...books, newBook]
    localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
    return newBook
  } catch (error) {
    console.error('Error adding book to localStorage:', error)
    return null
  }
}

// Update book in localStorage
const updateLocalBook = (id, updates) => {
  try {
    const books = getLocalBooks()
    const updatedBooks = books.map(book => 
      book.id === id ? { ...book, ...updates, updated_at: new Date().toISOString() } : book
    )
    localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
    return updatedBooks.find(book => book.id === id)
  } catch (error) {
    console.error('Error updating book in localStorage:', error)
    return null
  }
}

// Delete book from localStorage
const deleteLocalBook = (id) => {
  try {
    const books = getLocalBooks()
    const updatedBooks = books.filter(book => book.id !== id)
    localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
    return true
  } catch (error) {
    console.error('Error deleting book from localStorage:', error)
    return false
  }
} 