import { useState, useEffect } from 'react'
import TestSelectScreen from './components/TestSelectScreen'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import './index.css'

export default function App() {
  const [phase, setPhase] = useState('testSelect') // testSelect | start | quiz | result
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/tests.json')
      .then(r => r.json())
      .then(data => {
        setTests(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSelectTest = (test) => {
    setSelectedTest(test)
    setPhase('start')
  }

  const handleStart = (name, email) => {
    setUserName(name)
    setUserEmail(email)
    setLoading(true)
    fetch(selectedTest.file)
      .then(r => r.json())
      .then(data => {
        setQuestions(data)
        setLoading(false)
        setPhase('quiz')
      })
      .catch(() => setLoading(false))
  }

  const handleFinish = (submittedAnswers) => {
    setAnswers(submittedAnswers)
    setPhase('result')
  }

  const handleRestart = () => {
    setAnswers([])
    setQuestions([])
    setUserName('')
    setUserEmail('')
    setSelectedTest(null)
    setPhase('testSelect')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {phase === 'testSelect' && (
        <TestSelectScreen tests={tests} onSelect={handleSelectTest} />
      )}
      {phase === 'start' && selectedTest && (
        <StartScreen
          test={selectedTest}
          onStart={handleStart}
          onBack={() => setPhase('testSelect')}
        />
      )}
      {phase === 'quiz' && (
        <QuizScreen
          questions={questions}
          userName={userName}
          testLabel={selectedTest?.label}
          onFinish={handleFinish}
        />
      )}
      {phase === 'result' && (
        <ResultScreen
          questions={questions}
          answers={answers}
          userName={userName}
          userEmail={userEmail}
          testLabel={selectedTest?.label}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
