import { NextResponse } from 'next/server'
import { analyzeJournalEntry, generateReflectionPrompts, suggestRemedies, testClaudeConnection, getClaudeStatus } from '../../../lib/claudeAPI'
import { getUserProfile } from '../../../lib/dataService'

// POST /api/claude/analyze - Analyze a journal entry
export async function POST(request) {
  try {
    const { content, entryId } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Journal entry content is required' },
        { status: 400 }
      )
    }

    console.log('📝 Analyzing journal entry:', entryId ? `ID: ${entryId}` : 'New entry')

    // Get user profile for context (if available)
    let userProfile = null
    try {
      userProfile = await getUserProfile()
    } catch (error) {
      console.log('Could not fetch user profile for analysis context:', error.message)
    }

    // Analyze the journal entry
    const analysis = await analyzeJournalEntry(content, userProfile)

    if (!analysis.success) {
      return NextResponse.json(
        { error: analysis.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: analysis.analysis,
      remedies: analysis.remedies,
      prompts: analysis.prompts,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in Claude analysis API:', error)
    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    )
  }
}

// GET /api/claude/status - Check Claude API status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'test') {
      // Test Claude API connection
      const testResult = await testClaudeConnection()
      return NextResponse.json(testResult)
    }

    // Return Claude API status
    const status = getClaudeStatus()
    return NextResponse.json(status)

  } catch (error) {
    console.error('❌ Error in Claude status API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
