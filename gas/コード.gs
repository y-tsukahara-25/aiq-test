// Google Apps Script — AIスキルテスト 結果受信・メール送信スクリプト
// このファイルをコピーして Google Apps Script に貼り付けてください

const SHEET_NAME = 'テスト結果';
const ADMIN_EMAILS = ['y-tsukahara@tre-pro.co.jp', 'y-fukuoka@tre-pro.co.jp'];

function doPost(e) {
  try {
    // form-encoded（URLSearchParams）とJSON両方に対応
    const data = (e.parameter && e.parameter.data)
      ? JSON.parse(e.parameter.data)
      : JSON.parse(e.postData.contents);

    // 1. スプレッドシートに記録
    saveToSheet(data);

    // 2. 受講者にメール送信
    if (data.email) {
      sendResultEmail(data.email, data, false);
    }

    // 3. 管理者にメール送信
    ADMIN_EMAILS.forEach(adminEmail => {
      sendResultEmail(adminEmail, data, true);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['日時', '名前', 'メール', 'スコア', '正解率(%)'];
    sheet.appendRow(headers);
  }

  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  data.answers.forEach((a, i) => {
    const colHeader = `Q${a.no}: ${a.question.substring(0, 20)}...`;
    if (!headerRow.includes(colHeader)) {
      sheet.getRange(1, headerRow.length + 1).setValue(colHeader);
      headerRow.push(colHeader);
    }
  });

  const row = [data.date, data.name, data.email || '', data.score, data.scorePercent];
  data.answers.forEach(a => {
    row.push(`${a.isCorrect}: ${a.userAnswer}`);
  });
  sheet.appendRow(row);
}

function sendResultEmail(toEmail, data, isAdmin) {
  const testName = data.testLabel || 'AIスキルテスト';
  const subject = isAdmin
    ? `【${testName}結果】${data.name}さん — ${data.score}問正解（${data.scorePercent}%）`
    : `【${testName}】あなたの結果と解説 — ${data.score}問正解（${data.scorePercent}%）`;

  const emoji = data.scorePercent >= 80 ? '🎉' : data.scorePercent >= 60 ? '👍' : '📚';
  const message = data.scorePercent >= 80 ? '素晴らしい成績です！' : data.scorePercent >= 60 ? 'もう少しで合格ラインです！' : '引き続き学習を続けましょう！';

  const answersHtml = data.answers.map(a => {
    const isText = a.type === 'text';
    const icon = isText ? '📝' : a.isCorrect === '正解' ? '✅' : '❌';
    const bgColor = isText ? '#f9f9f9' : a.isCorrect === '正解' ? '#f0fdf4' : '#fef2f2';
    const borderColor = isText ? '#e5e7eb' : a.isCorrect === '正解' ? '#86efac' : '#fca5a5';

    return `
      <div style="border:2px solid ${borderColor}; background:${bgColor}; border-radius:12px; padding:16px; margin-bottom:12px;">
        <p style="margin:0 0 8px 0; font-weight:bold; color:#1f2937; font-size:14px;">
          ${icon} Q${a.no}. ${a.question}
        </p>
        <p style="margin:0 0 4px 0; font-size:13px; color:#4b5563;">
          あなたの回答：<strong>${a.userAnswer}</strong>
        </p>
        ${!isText && a.isCorrect === '不正解' ? `
        <p style="margin:0 0 4px 0; font-size:13px; color:#15803d;">
          正解：<strong>${a.correctAnswer}</strong>
        </p>` : ''}
        ${a.explanation ? `
        <p style="margin:8px 0 0 0; font-size:12px; color:#6b7280; border-top:1px solid #e5e7eb; padding-top:8px;">
          💡 ${a.explanation}
        </p>` : ''}
      </div>
    `;
  }).join('');

  const adminNote = isAdmin ? `
    <div style="background:#fef3c7; border:1px solid #fcd34d; border-radius:8px; padding:12px; margin-bottom:20px; font-size:13px; color:#92400e;">
      📋 管理者通知 — ${data.name}さん（${data.email || 'メールアドレスなし'}）の受講結果です
    </div>` : '';

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3b82f6,#6366f1); padding:32px; text-align:center;">
      <div style="font-size:48px; margin-bottom:8px;">${emoji}</div>
      <h1 style="color:white; margin:0; font-size:22px;">AI スキルテスト 結果</h1>
      <p style="color:rgba(255,255,255,0.8); margin:8px 0 0 0; font-size:14px;">${data.date}</p>
    </div>

    <!-- Score -->
    <div style="padding:32px; text-align:center; border-bottom:1px solid #e5e7eb;">
      ${adminNote}
      <p style="color:#6b7280; margin:0 0 4px 0; font-size:14px;">${data.name} さん</p>
      <div style="font-size:56px; font-weight:bold; color:${data.scorePercent >= 80 ? '#16a34a' : data.scorePercent >= 60 ? '#ca8a04' : '#dc2626'};">
        ${data.scorePercent}<span style="font-size:28px;">%</span>
      </div>
      <p style="color:#374151; font-size:16px; margin:4px 0 0 0;">${data.score}問正解 — ${message}</p>
    </div>

    <!-- Answers -->
    <div style="padding:24px;">
      <h2 style="color:#374151; font-size:16px; margin:0 0 16px 0; font-weight:bold;">📖 回答の振り返り</h2>
      ${answersHtml}
    </div>

    <!-- Footer -->
    <div style="padding:20px 24px; background:#f9fafb; text-align:center; border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af; font-size:12px; margin:0;">TrePro 社内 AI スキルテスト</p>
    </div>
  </div>
</body>
</html>
  `;

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: html,
  });
}

// CORSプリフライト対応
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// メール送信テスト用（権限確認に使用）
function testEmail() {
  MailApp.sendEmail({
    to: 'y-tsukahara@tre-pro.co.jp',
    subject: 'テスト送信 - AIスキルテスト',
    body: 'GASのメール送信テストです。正常に動作しています。'
  });
  Logger.log('送信完了');
}
