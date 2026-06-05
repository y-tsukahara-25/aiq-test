import { useState } from 'react'

export default function StartScreen({ test, onStart, onBack }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'お名前を入力してください'
    if (!email.trim()) {
      e.email = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = '正しいメールアドレス形式で入力してください'
    }
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onStart(name.trim(), email.trim())
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">{test.label}</h1>
          <p className="text-gray-400 text-sm">{test.timeGuide}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
          <p className="mb-1">{test.description}</p>
          <p className="mt-2 text-xs text-blue-500">📧 終了後、あなたのメールに結果と解説を送信します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              placeholder="例：山田 太郎"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              placeholder="例：yamada@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-400 mt-1">テスト結果と解説を送信します</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            テストを開始する →
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
          >
            ← テスト一覧に戻る
          </button>
        </form>
      </div>
    </div>
  )
}
