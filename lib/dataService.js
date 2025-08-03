import { supabase } from './supabase'
import { calculateNatalChart, calculateDoshas, formatNatalChartForAI } from './natalChart.js'
import { calculateSimpleNatalChart, debugSimplePlanetPosition } from './simpleNatalChart.js'
import { getVedicData, formatVedicData } from './astronomy'
import { getNatalChartAPI, debugAPICalculation } from './astrologyAPI.js'

// Database table names
const TABLES = {
  ENTRIES: 'journal_entries',
  IMAGES: 'journal_images',
  NON_NEGOTIABLES: 'non_negotiables'
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
          id BIGINT PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          timestamp TIMESTAMPTZ NOT NULL,
          review_of_activities TEXT,
          discipline INTEGER,
          surrender INTEGER,
          gratitude TEXT,
          pain TEXT,
          insights TEXT,
          attachments JSONB,
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
          ADD COLUMN IF NOT EXISTS review_of_activities TEXT,
          ADD COLUMN IF NOT EXISTS discipline INTEGER,
          ADD COLUMN IF NOT EXISTS surrender INTEGER,
          ADD COLUMN IF NOT EXISTS gratitude TEXT,
          ADD COLUMN IF NOT EXISTS pain TEXT,
          ADD COLUMN IF NOT EXISTS insights TEXT,
          ADD COLUMN IF NOT EXISTS attachments JSONB;
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
      ...entry,
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
export const generateInstructionTemplate = async (userConfig = {}) => {
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

  // Calculate natal chart if birth data is provided
  let natalChartData = null
  let doshaAnalysis = null
  
  if (birthDate && birthDate !== '[Not provided]' && 
      birthTime && birthTime !== '[Not provided]' &&
      birthLatitude && birthLatitude !== '[Not provided]' &&
      birthLongitude && birthLongitude !== '[Not provided]') {
    try {
      // Try API first for professional accuracy, fall back to local calculations
      try {
        const apiNatalChart = await getNatalChartAPI(birthDate, birthTime, birthLatitude, birthLongitude)
        if (apiNatalChart && apiNatalChart.planets && apiNatalChart.planets.length > 0) {
          // Use API data
          natalChartData = apiNatalChart
          // Calculate doshas from API data
          const doshas = calculateDoshas(apiNatalChart)
          doshaAnalysis = doshas
          console.log('Using API natal chart data')
        } else {
          throw new Error('API returned invalid data')
        }
      } catch (apiError) {
        console.warn('API failed, using local calculations:', apiError)
        // Fall back to local calculations
        const natalChart = calculateSimpleNatalChart(birthDate, birthTime, parseFloat(birthLatitude), parseFloat(birthLongitude))
        const doshas = calculateDoshas(natalChart)
        natalChartData = formatNatalChartForAI(natalChart, doshas)
        doshaAnalysis = doshas
      }
    } catch (error) {
      console.error('Error calculating natal chart:', error)
    }
  }

  return `# Transformation Journal Data Analysis Request

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
**Ascendant (Lagna)**: ${natalChartData.ascendant.rashi} ${natalChartData.ascendant.degree}° - ${natalChartData.ascendant.nakshatra}

**Planetary Positions**:
${natalChartData.planets.map(p => `- ${p.planet}: ${p.rashi} ${p.degree}° - ${p.nakshatra}`).join('\n')}

**Dosha Balance**:
- Vata: ${doshaAnalysis.vata}%
- Pitta: ${doshaAnalysis.pitta}%
- Kapha: ${doshaAnalysis.kapha}%

**Houses**:
${natalChartData.houses.map(h => `- House ${h.house}: ${h.rashi} ${h.degree}°`).join('\n')}
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

## Requested Output Format
Please provide:
1. **Executive Summary**: 2-3 key insights about this entry
2. **Detailed Analysis**: Breakdown by categories above
3. **Cosmic Insights**: Vedic astrology correlations and patterns
4. **Natal Chart Analysis**: How your birth chart (if provided) relates to current patterns and recommendations
5. **Vedic Remedies**: Traditional practices that might support your goals
5. **Specific Practices**: 
   - **Mudras**: Recommended hand gestures with instructions
   - **Acupressure**: Key pressure points with application methods
   - **Pranayama**: Breathing techniques with timing and duration
   - **Herbs & Spices**: Specific recommendations with usage
   - **Food Recommendations**: Specific foods, meals, and dietary practices with timing and preparation methods
   - **Aromatherapy & Fragrances**: Essential oils, incense, and fragrances with application methods, timing, and dosha-specific recommendations
   - **Gemstones**: Recommended stones with wearing instructions and timing
   - **Mantras**: Sacred sounds for current cosmic influences
   - **Yoga Asanas**: Postures aligned with current energies
6. **Actionable Recommendations**: Specific changes to optimize my practices
7. **Pattern Recognition**: What patterns does this entry reveal?
8. **Questions for Deeper Investigation**: What should I track more closely?`
}

// Backup and restore operations
export const exportData = async () => {
  try {
    const [entries, nonNegotiables] = await Promise.all([
      getEntries(),
      getNonNegotiables()
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

    // Get user profile and calculate natal chart
    let natalChartData = null
    try {
      const userProfile = await getUserProfile()
      if (userProfile && userProfile.birth_date && userProfile.birth_time && 
          userProfile.birth_latitude && userProfile.birth_longitude) {
        const natalChart = calculateSimpleNatalChart(
          userProfile.birth_date, 
          userProfile.birth_time, 
          userProfile.birth_latitude, 
          userProfile.birth_longitude
        )
        const doshas = calculateDoshas(natalChart)
        natalChartData = formatNatalChartForAI(natalChart, doshas)
      }
    } catch (error) {
      console.error('Error calculating natal chart for export:', error)
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
      instructions: generateInstructionTemplate(userConfig),
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

    // Ensure date is set
    const itemWithDate = {
      ...item,
      user_id: user.id,
      date: item.date || new Date().toISOString().split('T')[0]
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
            activity: entry.activity,
            gratitude: entry.gratitude,
            pain: entry.pain,
            insight: entry.insight,
            tradingMindset: entry.tradingMindset,
            spiritualState: entry.spiritualState,
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

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return data
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