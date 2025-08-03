// Universal Book Database for TEKNE Transformation Journal
// This database provides recommendations that can be personalized for any user

export const bookDatabase = {
  // Essential Trading Books (Universal - for anyone interested in trading)
  essentialTrading: [
    {
      title: "Mastering the Trade",
      author: "John Carter",
      category: "business_financial",
      priority: "essential",
      notes: "Essential trading psychology and strategy. Foundation for all trading success.",
      tags: ["trading", "psychology", "strategy", "foundation"]
    },
    {
      title: "Mastering the Trade: Proven Techniques",
      author: "John Carter",
      category: "business_financial", 
      priority: "essential",
      notes: "Advanced trading techniques and systems. Builds on the foundation.",
      tags: ["trading", "advanced", "techniques", "systems"]
    },
    {
      title: "Trading in the Zone",
      author: "Mark Douglas",
      category: "business_financial",
      priority: "essential", 
      notes: "Mastering the psychology of trading. Essential for mental discipline.",
      tags: ["trading", "psychology", "mental", "discipline"]
    },
    {
      title: "Trade Your Way to Financial Freedom",
      author: "Van Tharp",
      category: "business_financial",
      priority: "high",
      notes: "Position sizing and risk management. Critical for long-term success.",
      tags: ["trading", "risk", "position-sizing", "management"]
    },
    {
      title: "Market Wizards",
      author: "Jack Schwager",
      category: "business_financial",
      priority: "high",
      notes: "Interviews with top traders. Learn from the masters.",
      tags: ["trading", "interviews", "masters", "insights"]
    }
  ],

  // Business & Financial Development
  businessFinancial: [
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      category: "business_financial",
      priority: "high",
      notes: "Timeless lessons on wealth, greed, and happiness.",
      tags: ["money", "psychology", "wealth", "happiness"]
    },
    {
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      category: "business_financial",
      priority: "high",
      notes: "Financial education and mindset shift.",
      tags: ["money", "mindset", "education", "assets"]
    },
    {
      title: "The Millionaire Fastlane",
      author: "MJ DeMarco",
      category: "business_financial",
      priority: "high",
      notes: "Alternative path to wealth through entrepreneurship.",
      tags: ["wealth", "entrepreneurship", "fastlane", "business"]
    },
    {
      title: "Zero to One",
      author: "Peter Thiel",
      category: "business_financial",
      priority: "high",
      notes: "Notes on startups, or how to build the future.",
      tags: ["startups", "innovation", "future", "business"]
    }
  ],

  // Spiritual Development (Universal)
  spiritualDevelopment: [
    {
      title: "Autobiography of a Yogi",
      author: "Paramahansa Yogananda",
      category: "spiritual_development",
      priority: "high",
      notes: "Classic spiritual autobiography. Foundation for spiritual understanding.",
      tags: ["spiritual", "autobiography", "yoga", "consciousness"]
    },
    {
      title: "The Bhagavad Gita",
      author: "Various",
      category: "spiritual_development",
      priority: "high",
      notes: "Sacred Hindu scripture. Essential wisdom for life.",
      tags: ["spiritual", "hindu", "wisdom", "philosophy"]
    },
    {
      title: "Ayurveda: The Science of Self-Healing",
      author: "Dr. Vasant Lad",
      category: "spiritual_development",
      priority: "medium",
      notes: "Introduction to Ayurvedic principles and constitutional health.",
      tags: ["ayurveda", "health", "constitution", "healing"]
    },
    {
      title: "The Power of Now",
      author: "Eckhart Tolle",
      category: "spiritual_development",
      priority: "high",
      notes: "Guide to spiritual enlightenment and present moment awareness.",
      tags: ["spiritual", "enlightenment", "present", "awareness"]
    },
    {
      title: "The Untethered Soul",
      author: "Michael A. Singer",
      category: "spiritual_development",
      priority: "high",
      notes: "The journey beyond yourself.",
      tags: ["spiritual", "soul", "consciousness", "freedom"]
    }
  ],

  // Personal Development (Universal)
  personalDevelopment: [
    {
      title: "Atomic Habits",
      author: "James Clear",
      category: "personal_development",
      priority: "high",
      notes: "Building good habits and breaking bad ones. Tiny changes, remarkable results.",
      tags: ["habits", "behavior", "change", "productivity"]
    },
    {
      title: "Deep Work",
      author: "Cal Newport",
      category: "personal_development",
      priority: "high",
      notes: "Focus and productivity in a distracted world.",
      tags: ["focus", "productivity", "work", "concentration"]
    },
    {
      title: "Mastery",
      author: "Robert Greene",
      category: "personal_development",
      priority: "high",
      notes: "The path to mastery in any field.",
      tags: ["mastery", "expertise", "learning", "excellence"]
    },
    {
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen Covey",
      category: "personal_development",
      priority: "high",
      notes: "Powerful lessons in personal change.",
      tags: ["habits", "effectiveness", "principles", "character"]
    },
    {
      title: "Mindset",
      author: "Carol Dweck",
      category: "personal_development",
      priority: "high",
      notes: "The new psychology of success.",
      tags: ["mindset", "psychology", "success", "growth"]
    }
  ],

  // Diverse Learning
  diverseLearning: [
    {
      title: "Sapiens",
      author: "Yuval Noah Harari",
      category: "diverse_learning",
      priority: "high",
      notes: "A brief history of humankind.",
      tags: ["history", "humanity", "evolution", "culture"]
    },
    {
      title: "The Art of War",
      author: "Sun Tzu",
      category: "diverse_learning",
      priority: "medium",
      notes: "Ancient Chinese text on military strategy and tactics.",
      tags: ["strategy", "war", "leadership", "ancient"]
    },
    {
      title: "Meditations",
      author: "Marcus Aurelius",
      category: "diverse_learning",
      priority: "high",
      notes: "Personal writings of the Roman Emperor on Stoic philosophy.",
      tags: ["philosophy", "stoicism", "wisdom", "leadership"]
    },
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      category: "diverse_learning",
      priority: "medium",
      notes: "A novel about following your dreams and listening to your heart.",
      tags: ["fiction", "dreams", "journey", "inspiration"]
    }
  ]
}

// Function to get personalized book recommendations based on user profile
export const getPersonalizedRecommendations = (userProfile) => {
  const recommendations = []
  
  // Always include essential trading books if user has financial goals
  if (userProfile?.primaryGoals?.toLowerCase().includes('trading') || 
      userProfile?.primaryGoals?.toLowerCase().includes('financial') ||
      userProfile?.primaryGoals?.toLowerCase().includes('wealth')) {
    recommendations.push(...bookDatabase.essentialTrading)
    recommendations.push(...bookDatabase.businessFinancial)
  }

  // Add spiritual books if user has spiritual goals
  if (userProfile?.primaryGoals?.toLowerCase().includes('spiritual') ||
      userProfile?.primaryGoals?.toLowerCase().includes('consciousness') ||
      userProfile?.primaryGoals?.toLowerCase().includes('meditation')) {
    recommendations.push(...bookDatabase.spiritualDevelopment)
  }

  // Add personal development books (universal - everyone benefits)
  recommendations.push(...bookDatabase.personalDevelopment)

  // Add diverse learning books for broader perspective
  recommendations.push(...bookDatabase.diverseLearning)

  return recommendations
}

// Function to get reading schedule based on individual constitution
export const getPersonalizedReadingSchedule = (userProfile) => {
  if (!userProfile?.doshaBalance) return null

  const { vata, pitta, kapha } = userProfile.doshaBalance
  
  // Generate personalized reading times based on individual constitution
  if (kapha > 40) {
    return {
      morning: "6-8 AM: Light, action-oriented reading to stimulate energy",
      afternoon: "2-4 PM: Variety and stimulation to maintain engagement", 
      evening: "7-9 PM: Completion and structure to build momentum"
    }
  } else if (vata > 40) {
    return {
      morning: "7-9 AM: Grounding, structured reading to establish routine",
      afternoon: "1-3 PM: Focus on completion to build consistency",
      evening: "6-8 PM: Calming, routine reading to wind down"
    }
  } else if (pitta > 40) {
    return {
      morning: "5-7 AM: Cool, analytical reading before heat builds",
      afternoon: "3-5 PM: Avoid overstimulation, light reading only",
      evening: "8-10 PM: Relaxing, non-competitive content to cool down"
    }
  }
  
  return null
}

// Function to get category balance recommendations
export const getCategoryBalanceRecommendations = (userProfile, currentBooks) => {
  const categoryCounts = {
    business_financial: 0,
    spiritual_development: 0,
    personal_development: 0,
    diverse_learning: 0
  }

  currentBooks.forEach(book => {
    if (categoryCounts.hasOwnProperty(book.category)) {
      categoryCounts[book.category]++
    }
  })

  const recommendations = []

  // Suggest balance based on user's goals
  if (userProfile?.primaryGoals?.toLowerCase().includes('trading') && categoryCounts.business_financial < 3) {
    recommendations.push("Consider adding more business/financial books for your trading goals")
  }

  if (userProfile?.primaryGoals?.toLowerCase().includes('spiritual') && categoryCounts.spiritual_development < 2) {
    recommendations.push("Consider adding spiritual development books for your consciousness goals")
  }

  if (categoryCounts.personal_development < 2) {
    recommendations.push("Consider adding personal development books for overall growth")
  }

  if (categoryCounts.diverse_learning < 1) {
    recommendations.push("Consider adding diverse learning books for broader perspective")
  }

  return recommendations
}

// Function to get optimal reading times based on cosmic influences
export const getCosmicReadingRecommendations = (userProfile, cosmicData) => {
  if (!cosmicData || !userProfile?.enableCosmicFeatures) return null

  const recommendations = []

  // Suggest reading times based on nakshatra
  if (cosmicData.nakshatra) {
    const nakshatraRecommendations = {
      'Aardra': "Good time for analytical reading and problem-solving",
      'Uttaraashaada': "Excellent for completing books and building momentum",
      'Poorvaashaada': "Ideal for starting new books and learning",
      'Moola': "Good for deep, transformative reading"
    }
    
    if (nakshatraRecommendations[cosmicData.nakshatra]) {
      recommendations.push(nakshatraRecommendations[cosmicData.nakshatra])
    }
  }

  // Suggest reading types based on lunar phase
  if (cosmicData.lunarPhase) {
    if (cosmicData.lunarPhase === 'waxing') {
      recommendations.push("Waxing moon: Good time for starting new books and building knowledge")
    } else if (cosmicData.lunarPhase === 'waning') {
      recommendations.push("Waning moon: Good time for completing books and integrating knowledge")
    }
  }

  return recommendations
}

// Export all functions and data
export default {
  bookDatabase,
  getPersonalizedRecommendations,
  getPersonalizedReadingSchedule,
  getCategoryBalanceRecommendations,
  getCosmicReadingRecommendations
} 