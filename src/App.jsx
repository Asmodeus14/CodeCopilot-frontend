import React, { useState } from 'react'
import Logo from './components/Logo'
import ProjectUpload from './components/ProjectUpload'
import ResultsDashboard from './components/ResultsDashboard'
import BackendStatus from './components/backendstatus'

function App() {
  const [analysisResults, setAnalysisResults] = useState(null)

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results)
  }

  const handleReset = () => {
    setAnalysisResults(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-950 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 text-center py-12 px-4">
        <div className="flex justify-center mb-6">
          <Logo className="h-12" />
        </div>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-4">
          Automatically detect and fix web development issues in your projects
        </p>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {!analysisResults ? (
            <ProjectUpload onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <ResultsDashboard 
              analysisResults={analysisResults}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-500">
        <p>Built with React + Flask + Tailwind CSS</p>
      </footer>

      {/* Backend Status Indicator */}
      <BackendStatus />
    </div>
  )
}

export default App