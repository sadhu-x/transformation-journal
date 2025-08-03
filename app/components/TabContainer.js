'use client'

import { useState } from 'react'
import { BookOpen, CheckSquare, Book } from 'lucide-react'

export default function TabContainer({ children, activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'journal',
      label: 'Journal Entries',
      icon: BookOpen,
      count: null
    },
    {
      id: 'non-negotiables',
      label: 'Non-Negotiables',
      icon: CheckSquare,
      count: null
    },
    {
      id: 'books',
      label: 'Reading List',
      icon: Book,
      count: null
    }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  )
} 