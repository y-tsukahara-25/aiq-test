import { useState } from 'react'

function SingleChoice({ options, value, onChange }) {
  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
            ${value === i
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
        >
          <input
            type="radio"
            name="single"
            checked={value === i}
            onChange={() => onChange(i)}
            className="hidden"
          />
          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0
            ${value === i ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-400'}`}>
            {String.fromCharCode(65 + i)}
          </span>
          <span className="text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function TrueFalse({ value, onChange }) {
  return (
    <div className="flex gap-4">
      {[{ label: '○ 正しい', val: true }, { label: '× 間違い', val: false }].map(({ label, val }) => (
        <button
          key={String(val)}
          type="button"
          onClick={() => onChange(val)}
          className={`flex-1 py-5 rounded-xl border-2 text-lg font-bold transition-all
            ${value === val
              ? val ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function MultipleChoice({ options, value = [], onChange }) {
  const toggle = (i) => {
    if (value.includes(i)) {
      onChange(value.filter(v => v !== i))
    } else {
      onChange([...value, i])
    }
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-1">※ 当てはまるものをすべて選択してください</p>
      {options.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
            ${value.includes(i)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
        >
          <input
            type="checkbox"
            checked={value.includes(i)}
            onChange={() => toggle(i)}
            className="hidden"
          />
          <span className={`w-7 h-7 rounded border-2 flex items-center justify-center shrink-0
            ${value.includes(i) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
            {value.includes(i) && <span className="text-white text-sm">✓</span>}
          </span>
          <span className="text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function TextInput({ value = '', onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">※ 記述式：自由に回答してください</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="こちらに回答を入力してください..."
        rows={5}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />
    </div>
  )
}

export default function QuizScreen({ questions, userName, testLabel, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))

  const q = questions[current]
  const currentAnswer = answers[current]

  const setAnswer = (val) => {
    const updated = [...answers]
    updated[current] = val
    setAnswers(updated)
  }

  const canProceed = () => {
    if (q.type === 'text') return (currentAnswer || '').trim().length > 0
    if (q.type === 'multiple') return Array.isArray(currentAnswer) && currentAnswer.length > 0
    return currentAnswer !== null && currentAnswer !== undefined
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
    } else {
      onFinish(answers)
    }
  }

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500 truncate max-w-[50%]">{testLabel ?? ''}</span>
            <span className="text-sm font-medium text-gray-600">
              {current + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {q.category}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {q.type === 'single' && `${q.options?.length ?? 4}択`}
              {q.type === 'truefalse' && '○×'}
              {q.type === 'multiple' && '複数選択'}
              {q.type === 'text' && '記述式'}
            </span>
            {q.test && (
              <span className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">
                テスト{q.test}
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 leading-relaxed">
            Q{current + 1}. {q.question}
          </h2>

          {q.type === 'single' && (
            <SingleChoice options={q.options} value={currentAnswer} onChange={setAnswer} />
          )}
          {q.type === 'truefalse' && (
            <TrueFalse value={currentAnswer} onChange={setAnswer} />
          )}
          {q.type === 'multiple' && (
            <MultipleChoice options={q.options} value={currentAnswer} onChange={setAnswer} />
          )}
          {q.type === 'text' && (
            <TextInput value={currentAnswer} onChange={setAnswer} />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          {current > 0 && (
            <button
              onClick={() => setCurrent(current - 1)}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← 戻る
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors
              ${canProceed()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {current < questions.length - 1 ? '次の問題 →' : '結果を見る ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
