const LEVEL_COLOR = {
  '初〜中級': 'bg-green-100 text-green-700',
  '中級': 'bg-blue-100 text-blue-700',
  '中〜上級': 'bg-indigo-100 text-indigo-700',
  '上級': 'bg-purple-100 text-purple-700',
  '実務応用': 'bg-orange-100 text-orange-700',
}

export default function TestSelectScreen({ tests, onSelect }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI スキルテスト</h1>
          <p className="text-gray-500 text-sm">受講するテストを選んでください</p>
        </div>

        <div className="space-y-3">
          {tests.map(test => (
            <button
              key={test.id}
              onClick={() => onSelect(test)}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-left hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                    {test.label}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {test.description}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLOR[test.level] ?? 'bg-gray-100 text-gray-600'}`}>
                    {test.level}
                  </span>
                  <span className="text-xs text-gray-400">{test.timeGuide}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
