import './globals.css'
import { ThemeProvider } from './components/ThemeProvider'

export const metadata = {
  title: 'TEKNE - The Art of AI-Powered Self-Transformation',
  description: 'Craft your consciousness with AI intelligence. Track patterns, gain insights, and accelerate your transformation journey.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 