import { useState, useEffect } from 'react'

function isCorrect(q, answer) {
  if (q.type === 'text') return null
  if (q.type === 'single') return answer === q.answer
  if (q.type === 'truefalse') return answer === q.answer
  if (q.type === 'multiple') {
    if (!Array.isArray(answer)) return false
    const sorted = [...answer].sort()
    const correct = [...q.answer].sort()
    return sorted.length === correct.length && sorted.every((v, i) => v === correct[i])
  }
  return false
}

function formatAnswer(q, answer) {
  if (answer === null || answer === undefined) return '（未回答）'
  if (q.type === 'single') return q.options[answer] ?? '（未回答）'
  if (q.type === 'truefalse') return answer ? '○ 正しい' : '× 間違い'
  if (q.type === 'multiple') {
    if (!Array.isArray(answer) || answer.length === 0) return '（未選択）'
    return answer.map(i => q.options[i]).join('、')
  }
  if (q.type === 'text') return answer || '（未入力）'
  return String(answer)
}

function formatCorrect(q) {
  if (q.type === 'single') return q.options[q.answer]
  if (q.type === 'truefalse') return q.answer ? '○ 正しい' : '× 間違い'
  if (q.type === 'multiple') return q.answer.map(i => q.options[i]).join('、')
  return null
}

export default function ResultScreen({ questions, answers, userName, userEmail, testLabel, onRestart }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const gradable = questions.filter(q => q.type !== 'text')
  const correct = gradable.filter(q => {
    const idx = questions.indexOf(q)
    return isCorrect(q, answers[idx])
  }).length

  const scorePercent = gradable.length > 0 ? Math.round((correct / gradable.length) * 100) : 0
  const scoreColor = scorePercent >= 80 ? 'text-green-600' : scorePercent >= 60 ? 'text-yellow-600' : 'text-red-500'
  const scoreMessage = scorePercent >= 80 ? '素晴らしい！' : scorePercent >= 60 ? 'もう少し！' : '要復習'

  const submitResults = async () => {
    const gasUrl = import.meta.env.VITE_GAS_URL
    if (!gasUrl) {
      console.warn('[AIQテスト] VITE_GAS_URL が未設定です。.env に GAS の URL を設定してください。')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        name: userName,
        email: userEmail,
        testLabel: testLabel ?? '',
        date: new Date().toLocaleString('ja-JP'),
        score: `${correct}/${gradable.length}`,
        scorePercent,
        answers: questions.map((q, i) => ({
          no: i + 1,
          category: q.category ?? '',
          question: q.question,
          type: q.type,
          userAnswer: formatAnswer(q, answers[i]),
          correctAnswer: q.type !== 'text' ? (formatCorrect(q) ?? '') : '',
          isCorrect: q.type === 'text' ? '記述式' : isCorrect(q, answers[i]) ? '正解' : '不正解',
          explanation: q.explanation ?? '',
        })),
      }
      // GAS はリダイレクトで POST body が消えるため form-encoded で送信
      const form = new URLSearchParams()
      form.append('data', JSON.stringify(payload))
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: form,
      })
      setSubmitted(true)
      setEmailSent(true)
    } catch (err) {
      console.error('[AIQテスト] 結果送信エラー:', err)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    submitResults()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
        {/* Score Header */}
        <div className="p-8 text-center border-b border-gray-100">
          <div className="text-4xl mb-2">
            {scorePercent >= 80 ? '🎉' : scorePercent >= 60 ? '👍' : '📚'}
          </div>
          {testLabel && <p className="text-xs text-gray-400 mb-1">{testLabel}</p>}
          <h1 className="text-xl font-bold text-gray-800 mb-1">{userName} さんの結果</h1>
          <p className="text-gray-500 text-sm mb-4">{scoreMessage}</p>
          <div className={`text-5xl font-bold ${scoreColor}`}>
            {scorePercent}<span className="text-2xl">%</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {gradable.length}問中 {correct}問正解（記述式{questions.filter(q => q.type === 'text').length}問を除く）
          </p>

          <div className="mt-4 space-y-2">
            {submitting && (
              <p className="text-gray-400 text-sm">結果を送信中...</p>
            )}
            {!import.meta.env.VITE_GAS_URL && !submitting && (
              <div className="bg-yellow-50 text-yellow-700 text-xs py-2 px-4 rounded-lg inline-block">
                ⚠️ GAS URLが未設定のため、メール送信・集計が無効です
              </div>
            )}
            {submitted && (
              <div className="space-y-1">
                <div className="bg-green-50 text-green-700 text-sm py-2 px-4 rounded-lg inline-block">
                  ✓ 結果を管理者に送信しました
                </div>
                {emailSent && userEmail && (
                  <div className="bg-blue-50 text-blue-700 text-sm py-2 px-4 rounded-lg inline-block block">
                    📧 結果と解説を <span className="font-medium">{userEmail}</span> に送信しました
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Answer Review */}
        <div className="p-6 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">回答の振り返り</h2>
          {questions.map((q, i) => {
            const result = isCorrect(q, answers[i])
            const isText = q.type === 'text'
            return (
              <div
                key={q.id}
                className={`rounded-xl border-2 p-4 ${
                  isText ? 'border-gray-200' :
                  result ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">
                    {isText ? '📝' : result ? '✅' : '❌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm mb-2">Q{i + 1}. {q.question}</p>
                    <p className="text-sm text-gray-600">
                      あなたの回答：<span className="font-medium">{formatAnswer(q, answers[i])}</span>
                    </p>
                    {!isText && !result && (
                      <p className="text-sm text-green-700 mt-1">
                        正解：<span className="font-medium">{formatCorrect(q)}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed border-t border-gray-200 pt-2">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onRestart}
            className="w-full border border-gray-300 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            もう一度挑戦する
          </button>
        </div>
      </div>
    </div>
  )
}
