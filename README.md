# AI スキルテスト アプリ

社内向け AIリテラシー確認テスト。選択式・記述式の混合形式で、結果を Google スプレッドシートに自動集計します。

---

## 機能

- 4択・○×・複数選択・記述式 の混合問題に対応
- テスト開始時に名前を入力（ログイン不要）
- 回答後にスコアと解説を表示
- 結果を Google スプレッドシートに自動送信（管理者が一覧確認可能）

---

## ファイル構成

```
AIQテスト/
├── public/
│   └── questions.json        ← 問題データ（ここを編集）
├── src/
│   ├── components/
│   │   ├── StartScreen.jsx   ← 開始画面
│   │   ├── QuizScreen.jsx    ← 問題画面
│   │   └── ResultScreen.jsx  ← 結果画面
│   └── App.jsx
├── gas/
│   └── コード.gs             ← Google Apps Script（結果受信）
├── .env                      ← APIキー・URL管理（Gitに含めない）
├── TROUBLE_LOG.md            ← 躓き・失敗・疑問の記録
└── README.md
```

---

## セットアップ手順

### 1. 問題を用意する（questions.json）

`public/questions.json` を編集してください。4種類の問題形式があります。

```json
[
  // ① 4択問題
  {
    "id": 1,
    "type": "single",
    "category": "カテゴリ名",
    "question": "問題文",
    "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
    "answer": 0,
    "explanation": "解説文"
  },

  // ② ○× 問題
  {
    "id": 2,
    "type": "truefalse",
    "category": "カテゴリ名",
    "question": "問題文",
    "answer": true,
    "explanation": "解説文"
  },

  // ③ 複数選択問題
  {
    "id": 3,
    "type": "multiple",
    "category": "カテゴリ名",
    "question": "問題文",
    "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
    "answer": [0, 2],
    "explanation": "解説文"
  },

  // ④ 記述式（採点なし・回答のみ収集）
  {
    "id": 4,
    "type": "text",
    "category": "カテゴリ名",
    "question": "問題文",
    "answer": null,
    "explanation": "解説や補足コメント"
  }
]
```

### 2. 結果集計用スプレッドシートを設定する

1. Google スプレッドシートで新規ファイルを作成
2. メニューの「拡張機能」→「Apps Script」を開く
3. `gas/コード.gs` の内容をすべてコピーして貼り付け → 保存
4. 「デプロイ」→「新しいデプロイ」→「種類：ウェブアプリ」を選択
5. 「アクセスできるユーザー：全員」に設定してデプロイ
6. 発行された URL をコピー

### 3. .env に URL を設定する

```env
VITE_GAS_URL=https://script.google.com/macros/s/xxxxxxx/exec
```

### 4. ローカルで起動確認

```bash
npm install
npm run dev
```

### 5. Vercel / Netlify にデプロイ

```bash
npm run build   # dist/ フォルダが生成される
```

**Vercel：** プロジェクト設定 → Environment Variables に `VITE_GAS_URL` を追加してデプロイ

**Netlify：** `dist/` フォルダをアップロード。Site settings → Environment variables に `VITE_GAS_URL` を追加

---

## 問題の追加・編集

`public/questions.json` を直接編集するだけで問題が変更されます。
デプロイ済みの場合はファイル変更後に `npm run build` して再デプロイしてください。

---

## 管理者向け：結果の確認

Google スプレッドシートの「テスト結果」シートに以下が自動記録されます。

| 日時 | 名前 | スコア | 正解率(%) | Q1: ... | Q2: ... |
|------|------|--------|-----------|---------|---------|
| 2026/06/05 | 山田太郎 | 3/4 | 75 | 正解: ... | 不正解: ... |

---

## TROUBLE_LOG.md

躓き・エラー・疑問は [TROUBLE_LOG.md](./TROUBLE_LOG.md) に記録しています。
