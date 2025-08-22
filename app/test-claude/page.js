'use client'

import { useState } from 'react'

export default function TestClaudePage() {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testContent, setTestContent] = useState("I'm feeling grateful today for the beautiful weather and the support of my friends. I want to focus on maintaining this positive energy throughout the week and continue my meditation practice.")

  const runTests = async () => {
    setIsLoading(true)
    setTestResults(null)

    try {
      const results = {
        status: null,
        connection: null,
        analysis: null,
        summary: { passed: 0, failed: 0 }
      }

      // Test 1: Check Claude API status
      console.log('1. Checking Claude API status...')
      const statusResponse = await fetch('/api/claude')
      results.status = {
        success: statusResponse.ok,
        data: await statusResponse.json()
      }
      results.summary[statusResponse.ok ? 'passed' : 'failed']++

      // Test 2: Test Claude API connection
      console.log('2. Testing Claude API connection...')
      const testResponse = await fetch('/api/claude?action=test')
      results.connection = {
        success: testResponse.ok,
        data: await testResponse.json()
      }
      results.summary[testResponse.ok ? 'passed' : 'failed']++

      // Test 3: Test manual analysis
      console.log('3. Testing manual analysis...')
      const analysisResponse = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: testContent,
          entryId: 'test-entry'
        })
      })
      
      results.analysis = {
        success: analysisResponse.ok,
        data: await analysisResponse.json()
      }
      results.summary[analysisResponse.ok ? 'passed' : 'failed']++

      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults({
        error: error.message,
        summary: { passed: 0, failed: 3 }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🤖 Claude API Integration Test
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Content:
            </label>
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter test content for Claude analysis..."
            />
          </div>

          <button
            onClick={runTests}
            disabled={isLoading}
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Running Tests...' : 'Run Claude API Tests'}
          </button>

          {testResults && (
            <div className="mt-8 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Test Results
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${testResults.summary.passed > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {testResults.summary.passed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${testResults.summary.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {testResults.summary.failed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${testResults.summary.passed === 3 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {testResults.summary.passed === 3 ? '✅' : '⚠️'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                  </div>
                </div>

                {testResults.error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <h3 className="text-red-800 dark:text-red-200 font-medium">Error</h3>
                    <p className="text-red-700 dark:text-red-300">{testResults.error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Status Test */}
                    <div className={`border rounded-md p-4 ${testResults.status?.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
                      <h3 className={`font-medium ${testResults.status?.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        1. Claude API Status {testResults.status?.success ? '✅' : '❌'}
                      </h3>
                      <pre className="text-sm mt-2 overflow-auto">
                        {JSON.stringify(testResults.status?.data, null, 2)}
                      </pre>
                    </div>

                    {/* Connection Test */}
                    <div className={`border rounded-md p-4 ${testResults.connection?.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
                      <h3 className={`font-medium ${testResults.connection?.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        2. Claude API Connection {testResults.connection?.success ? '✅' : '❌'}
                      </h3>
                      <pre className="text-sm mt-2 overflow-auto">
                        {JSON.stringify(testResults.connection?.data, null, 2)}
                      </pre>
                    </div>

                    {/* Analysis Test */}
                    <div className={`border rounded-md p-4 ${testResults.analysis?.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
                      <h3 className={`font-medium ${testResults.analysis?.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        3. Claude Analysis {testResults.analysis?.success ? '✅' : '❌'}
                      </h3>
                      <pre className="text-sm mt-2 overflow-auto">
                        {JSON.stringify(testResults.analysis?.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">How to Use This Test</h3>
            <ol className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>1. Make sure your Claude API key is set in <code>.env.local</code></li>
              <li>2. Restart your development server</li>
              <li>3. Click "Run Claude API Tests"</li>
              <li>4. Check the results - all 3 tests should pass</li>
              <li>5. If tests fail, check the error messages for troubleshooting</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
