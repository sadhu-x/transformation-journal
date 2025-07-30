'use client'

import { useState } from 'react'
import { Download, Database } from 'lucide-react'
import { exportData, generateInstructionTemplate } from '../../lib/dataService'

export default function ExportDropdown({ entries }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportAsJSON = async () => {
    setIsExporting(true)
    try {
      // Use database export to get complete data with images and instructions
      const exportPackage = await exportData()
      const dataStr = JSON.stringify(exportPackage, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tekne-journal-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      // Fallback to local data with instructions
      const userConfig = JSON.parse(localStorage.getItem('user-config') || '{}')
      const fallbackPackage = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          totalEntries: entries.length,
          userConfig: userConfig,
          note: 'Fallback export - some data may be missing'
        },
        instructions: generateInstructionTemplate(userConfig),
        data: entries
      }
      const dataStr = JSON.stringify(fallbackPackage, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tekne-journal-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Download className="h-4 w-4 text-white" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={exportAsJSON}
              disabled={isExporting}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Database className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 