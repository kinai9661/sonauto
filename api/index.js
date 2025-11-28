// api/index.js - API 主頁
import { corsHeaders } from '../lib/utils.js';

export default function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sonauto API Proxy - Vercel</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:900px;margin:50px auto;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
    .container{background:rgba(255,255,255,.95);border-radius:20px;padding:40px;color:#1a202c;box-shadow:0 20px 60px rgba(0,0,0,.3)}
    h1{color:#667eea;font-size:2.5em;margin-bottom:10px}
    .subtitle{color:#718096;font-size:1.2em;margin-bottom:30px}
    code{background:#f7fafc;padding:3px 8px;border-radius:4px;color:#e53e3e;font-family:Monaco,monospace;font-size:.9em}
    .endpoint{margin:20px 0;padding:20px;background:#f7fafc;border-left:4px solid #667eea;border-radius:8px;transition:transform .2s}
    .endpoint:hover{transform:translateX(5px)}
    .method{display:inline-block;padding:4px 12px;border-radius:4px;font-weight:700;font-size:.85em;margin-right:10px}
    .post{background:#48bb78;color:#fff}
    .get{background:#4299e1;color:#fff}
    a{color:#667eea;text-decoration:none;font-weight:500}
    .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;color:#718096}
    .badge{display:inline-block;padding:4px 12px;background:#667eea;color:#fff;border-radius:12px;font-size:.85em;margin-left:10px}
  </style>
</head>
<body>
  <div class="container">
    <h1>🎵 Sonauto API Proxy</h1>
    <p class="subtitle">Vercel Serverless Functions 全球中轉服務<span class="badge">Vercel</span></p>
    <h2>📡 可用端點</h2>
    <div class="endpoint"><span class="method post">POST</span><strong>/api/generate</strong><p>生成新歌曲</p><code>{"prompt":"happy birthday","tags":["pop"],"num_songs":1}</code></div>
    <div class="endpoint"><span class="method get">GET</span><strong>/api/status?task_id=xxx</strong><p>查詢任務狀態</p></div>
    <div class="endpoint"><span class="method get">GET</span><strong>/api/result?task_id=xxx</strong><p>獲取生成結果</p></div>
    <div class="endpoint"><span class="method post">POST</span><strong>/api/extend</strong><p>延長歌曲</p></div>
    <div class="endpoint"><span class="method post">POST</span><strong>/api/inpaint</strong><p>替換片段（生成過渡）</p></div>
    <div class="endpoint"><span class="method get">GET</span><strong>/api/balance</strong><p>查詢配額餘額</p></div>
    <h2>📚 使用文檔</h2>
    <p>查看 <a href="https://github.com/kinai9661/sonauto" target="_blank">GitHub 倉庫</a> 獲取完整API文檔</p>
    <div class="footer"><p>Powered by Vercel Serverless Functions | Built with ❤️</p><p>部署時間: ${new Date().toISOString()}</p></div>
  </div>
</body>
</html>`;

  res.status(200).set({ 'Content-Type': 'text/html', ...corsHeaders() }).send(html);
}