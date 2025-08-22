# Claude API Setup Guide

## Overview

This guide explains how to set up Anthropic's Claude API for AI-powered journal entry analysis in the Transformation Journal application.

## Features

With Claude API integration, your journal entries will automatically receive:

- **Emotional State Analysis**: Understanding of your current emotional landscape
- **Key Themes Identification**: Recognition of recurring patterns and themes
- **Growth Insights**: Deep insights about personal development opportunities
- **Actionable Remedies**: Practical practices and exercises tailored to your needs
- **Reflection Prompts**: Thought-provoking questions to deepen your self-reflection

## Getting Started

### 1. Get Claude API Key

1. **Visit Anthropic**: Go to [console.anthropic.com](https://console.anthropic.com)
2. **Sign Up/Login**: Create an account or log in to your existing account
3. **Create API Key**: 
   - Navigate to "API Keys" section
   - Click "Create Key"
   - Give it a descriptive name (e.g., "Transformation Journal")
   - Copy the API key (starts with `sk-ant-`)

### 2. Configure Environment Variables

#### For Local Development (.env.local)

Create or update your `.env.local` file in the project root:

```env
# Claude API Configuration
CLAUDE_API_KEY=sk-ant-your_api_key_here

# Existing Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### For Production (Vercel)

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to the "Environment Variables" section
4. Add the following variable:
   - `CLAUDE_API_KEY` = your_claude_api_key

### 3. Test the Setup

#### Option 1: Use the Test Function

1. Open your browser console in the app
2. Run: `testClaudeConnection()`
3. Check for success/error messages

#### Option 2: Create a Test Entry

1. Write a journal entry with substantial content (>50 characters)
2. Save the entry
3. Check if AI analysis appears below the entry
4. Look for the "AI Insights" section

## How It Works

### Automatic Analysis

When you save a journal entry:

1. **Content Check**: System checks if entry has substantial content (>50 characters)
2. **API Call**: Claude API analyzes the entry content
3. **Structured Response**: AI provides analysis, remedies, and prompts
4. **Database Storage**: Results are saved with the entry
5. **UI Display**: Analysis appears in an expandable "AI Insights" section

### Analysis Components

#### 1. Emotional State
- Brief description of your emotional landscape
- Helps you understand your current state

#### 2. Key Themes
- Identified patterns and recurring topics
- Tagged for easy recognition

#### 3. Insights
- Deep analysis of what your entry reveals
- Growth opportunities and self-awareness

#### 4. Patterns
- Recurring behaviors or thought patterns
- Areas for conscious attention

#### 5. Growth Areas
- Specific areas for personal development
- Opportunities for transformation

#### 6. Strengths
- Recognition of your positive qualities
- What's working well for you

### Remedies & Practices

The AI suggests practical remedies categorized by:

- **Mindfulness**: Meditation, breathing, presence practices
- **Action**: Physical movement, creative expression
- **Reflection**: Journaling prompts, self-inquiry
- **Practice**: Daily routines, habits, rituals
- **Movement**: Exercise, yoga, dance
- **Connection**: Social activities, relationships

Each remedy includes:
- **Title**: Clear, actionable name
- **Description**: Detailed instructions
- **Category**: Type of practice
- **Priority**: High/Medium/Low importance
- **Time Estimate**: How long it takes

### Reflection Prompts

AI-generated questions to deepen your self-reflection:

- **Self-awareness**: Understanding yourself better
- **Gratitude**: Appreciation and thankfulness
- **Growth**: Personal development focus
- **Healing**: Emotional processing
- **Relationships**: Connection with others
- **Purpose**: Meaning and direction

Each prompt includes:
- **Question**: Thought-provoking inquiry
- **Category**: Focus area
- **Difficulty**: Easy/Medium/Challenging

## API Usage & Costs

### Model Used
- **Claude 3 Sonnet**: Best performance/cost ratio
- **Max Tokens**: 4000 per analysis
- **Response Format**: Structured JSON

### Cost Estimation
- **Free Tier**: $5 credit on signup
- **Paid Tier**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- **Typical Entry**: ~500-1000 tokens input, ~1000-2000 tokens output
- **Cost per Entry**: ~$0.01-0.03

### Rate Limits
- **Requests per minute**: 50
- **Requests per day**: 1000
- **Concurrent requests**: 5

## Troubleshooting

### Common Issues

1. **"Claude API not configured"**
   - Check that `CLAUDE_API_KEY` is set in environment variables
   - Verify the API key is correct and active
   - Restart your development server

2. **"Analysis failed"**
   - Check browser console for error details
   - Verify API key has sufficient credits
   - Check rate limits

3. **"No analysis appears"**
   - Ensure entry has >50 characters
   - Check network connectivity
   - Look for error messages in console

4. **"Invalid response format"**
   - Claude API may be experiencing issues
   - Try again in a few minutes
   - Check Anthropic status page

### Debug Commands

Run these in your browser console:

```javascript
// Test Claude connection
testClaudeConnection()

// Get Claude status
getClaudeStatus()

// Manually analyze an entry
analyzeEntryWithClaude("Your journal content here")
```

### Getting Help

- **Anthropic Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **API Status**: [status.anthropic.com](https://status.anthropic.com)
- **Support**: Contact Anthropic support for API issues

## Security Best Practices

1. **Never expose API key** in client-side code
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor API usage** to stay within limits
5. **Implement proper error handling** for failed requests

## Integration Notes

The Transformation Journal app:
- Handles Claude API calls securely on the server side
- Provides fallback behavior when API is unavailable
- Stores analysis results in Supabase for persistence
- Updates analysis when entries are modified
- Shows analysis status and loading states
- Allows manual refresh of analysis

Your Claude API is now ready to provide intelligent, personalized insights for your journal entries! 🌟
