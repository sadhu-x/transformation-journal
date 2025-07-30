'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-16 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label="Toggle dark mode"
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
          isDark ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        <div className="flex h-full w-full items-center justify-center">
          {isDark ? (
            <Moon size={14} className="text-gray-700" />
          ) : (
            <Sun size={14} className="text-yellow-500" />
          )}
        </div>
      </span>
    </button>
  )
} 