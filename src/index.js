/**
 * Sonauto.ai API Proxy for Cloudflare Workers
 * 支援歌曲生成、延長、過渡和唱歌電報視頻
 */

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    const routes = {
      "/": () => handleRoot(),
      "/api/generate": () => handleGenerate(request, env, ctx),
      "/api/status": () => handleStatus(request, env),
      "/api/result": () => handleResult(request, env),
      "/api/extend": () => handleExtend(request, env, ctx),
      "/api/inpaint": () => handleInpaint(request, env, ctx),
      "/api/balance": () => handleBalance(env),
      "/health": () => new Response("OK", { status: 200 }),
    };

    try {
      const handler = routes[path];
      if (handler) {
        const response = await handler();
        return addCORSHeaders(response);
      }
      return jsonResponse({ error: "Not Found" }, 404);
    } catch (error) {
      console.error("Error:", error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
};

function handleRoot() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Sonauto API Proxy</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body{font-family:-apple-system,sans-serif;max-width:900px;margin:50px auto;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
    .container{background:rgba(255,255,255,.95);border-radius:20px;padding:40px;color:#1a202c;box-shadow:0 20px 60px rgba(0,0,0,.3)}
    h1{color:#667eea;font-size:2.5em;margin-bottom:10px}
    .subtitle{color:#718096;font-size:1.2em;margin-bottom:30px}
    code{background:#f7fafc;padding:3px 8px;border-radius:4px;color:#e53e3e;font-family:Monaco,monospace;font-size:.9em}
    .endpoint{margin:20px 0;padding:20px;background:#f7fafc;border-left:4px solid #667eea;border-radius:8px;transition:transform .2s}
    .endpoint:hover{transform:translateX(5px)}
    .endpoint strong{color:#2d3748;font-size:1.1em}
    .endpoint p{color:#4a5568;margin:10px 0}
    .method{display:inline-block;padding:4px 12px;border-radius:4px;font-weight:700;font-size:.85em;margin-right:10px}
    .post{background:#48bb78;color:#fff}
    .get{background:#4299e1;color:#fff}
    a{color:#667eea;text-decoration:none;font-weight:500}
    a:hover{text-decoration:underline}
    .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;color:#718096}
  </style>
</head>
<body>
  <div class="container">
    <h1>🎵 Sonauto API Proxy</h1>
    <p class="subtitle">Cloudflare Workers 全球中轉服務</p>
    <h2>📡 可用端點</h2>
    <div class="endpoint"><span class="method post">POST</span><strong>/api/generate</strong><p>生成新歌曲</p><code>{"prompt":"happy birthday","tags":["pop"],"num_songs":1}</code></div>
    <div class="endpoint"><span class="method get">GET</span><strong>/api/status?task_id=xxx</strong><p>查詢任務狀態</p></div>
    <div class="endpoint"><span class="method get">GET</span><strong>/api/result?task_id=xxx</strong><p>獲取生成結果</p></div>
    <div class="endpoint"><span class="method post">POST</span><strong>/api/extend</strong><p>延長歌曲</p></div>
    <div class="endpoint"><span class="method post">POST</span><strong>/api/inpaint</strong><p>替換片段（生成過渡）</p></div>
    <div class="endpoint"><span class="method get">GET</span><strong>/api/balance</strong><p>查詢配額餘額</p></div>
    <h2>📚 文檔</h2>
    <p>查看 <a href="https://github.com/kinai9661/sonauto">GitHub 倉庫</a> 獲取完整文檔</p>
    <div class="footer"><p>Powered by Cloudflare Workers | Built with ❤️</p></div>
  </div>
</body>
</html>`;
  return new Response(html, {headers: {"Content-Type": "text/html; charset=utf-8"}});
}

async function handleGenerate(request, env, ctx) {
  const body = await request.json();
  const payload = {
    prompt: body.prompt,
    lyrics: body.lyrics,
    tags: body.tags,
    instrumental: body.instrumental || false,
    num_songs: body.num_songs || 1,
    output_format: body.output_format || "mp3",
    prompt_strength: body.prompt_strength || 2.3,
    balance_strength: body.balance_strength || 0.7,
    bpm: body.bpm,
  };
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === null) delete payload[key];
  });
  const response = await fetch("https://api.sonauto.ai/v1/generations", {
    method: "POST",
    headers: {"Authorization": `Bearer ${env.SONAUTO_API_KEY}`, "Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Sonauto API error: ${response.statusText}`);
  const data = await response.json();
  const taskId = data.task_id;
  await env.TASKS.put(taskId, JSON.stringify({status: "RECEIVED", type: "generate", created_at: Date.now(), params: body}), {expirationTtl: 604800});
  ctx.waitUntil(pollTaskStatus(taskId, env));
  return jsonResponse({task_id: taskId, status: "RECEIVED", message: "任務已創建，正在處理中"});
}

async function handleStatus(request, env) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("task_id");
  if (!taskId) return jsonResponse({error: "缺少 task_id 參數"}, 400);
  const cached = await env.TASKS.get(taskId);
  if (!cached) return jsonResponse({error: "任務不存在"}, 404);
  const data = JSON.parse(cached);
  return jsonResponse({task_id: taskId, status: data.status, updated_at: data.updated_at || data.created_at});
}

async function handleResult(request, env) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("task_id");
  if (!taskId) return jsonResponse({error: "缺少 task_id 參數"}, 400);
  const cached = await env.TASKS.get(taskId);
  if (!cached) return jsonResponse({error: "任務不存在"}, 404);
  const data = JSON.parse(cached);
  if (data.status !== "SUCCESS") {
    return jsonResponse({status: data.status, message: data.status === "FAILURE" ? "任務失敗" : "任務處理中", error: data.error}, 202);
  }
  return jsonResponse({task_id: taskId, status: "SUCCESS", song_urls: data.result.song_paths, lyrics: data.result.lyrics, completed_at: data.completed_at});
}

async function handleExtend(request, env, ctx) {
  const body = await request.json();
  const payload = {audio_url: body.audio_url, audio_base64: body.audio_base64, prompt: body.prompt, lyrics: body.lyrics, tags: body.tags, duration: body.duration || 15, side: body.side || "right", output_format: body.output_format || "mp3"};
  const response = await fetch("https://api.sonauto.ai/v1/generations/extend", {method: "POST", headers: {"Authorization": `Bearer ${env.SONAUTO_API_KEY}`, "Content-Type": "application/json"}, body: JSON.stringify(payload)});
  if (!response.ok) throw new Error(`Extend API error: ${response.statusText}`);
  const data = await response.json();
  const taskId = data.task_id;
  await env.TASKS.put(taskId, JSON.stringify({status: "RECEIVED", type: "extend", created_at: Date.now()}), {expirationTtl: 604800});
  ctx.waitUntil(pollTaskStatus(taskId, env));
  return jsonResponse({task_id: taskId, status: "RECEIVED"});
}

async function handleInpaint(request, env, ctx) {
  const body = await request.json();
  const payload = {audio_url: body.audio_url, audio_base64: body.audio_base64, sections: body.sections, lyrics: body.lyrics, tags: body.tags, prompt: body.prompt, selection_crop: body.selection_crop || false, output_format: body.output_format || "mp3"};
  const response = await fetch("https://api.sonauto.ai/v1/generations/inpaint", {method: "POST", headers: {"Authorization": `Bearer ${env.SONAUTO_API_KEY}`, "Content-Type": "application/json"}, body: JSON.stringify(payload)});
  if (!response.ok) throw new Error(`Inpaint API error: ${response.statusText}`);
  const data = await response.json();
  const taskId = data.task_id;
  await env.TASKS.put(taskId, JSON.stringify({status: "RECEIVED", type: "inpaint", created_at: Date.now()}), {expirationTtl: 604800});
  ctx.waitUntil(pollTaskStatus(taskId, env));
  return jsonResponse({task_id: taskId, status: "RECEIVED"});
}

async function handleBalance(env) {
  const response = await fetch("https://api.sonauto.ai/v1/credits/balance", {headers: {"Authorization": `Bearer ${env.SONAUTO_API_KEY}`}});
  if (!response.ok) throw new Error(`Balance API error: ${response.statusText}`);
  const data = await response.json();
  return jsonResponse(data);
}

async function pollTaskStatus(taskId, env) {
  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(5000);
    try {
      const statusResp = await fetch(`https://api.sonauto.ai/v1/generations/status/${taskId}`, {headers: {"Authorization": `Bearer ${env.SONAUTO_API_KEY}`}});
      if (!statusResp.ok) continue;
      const status = (await statusResp.text()).replace(/"/g, "");
      await env.TASKS.put(taskId, JSON.stringify({status: status, updated_at: Date.now()}), {expirationTtl: 604800});
      if (status === "SUCCESS" || status === "FAILURE") {
        const resultResp = await fetch(`https://api.sonauto.ai/v1/generations/${taskId}`, {headers: {"Authorization": `Bearer ${env.SONAUTO_API_KEY}`}});
        const result = await resultResp.json();
        await env.TASKS.put(taskId, JSON.stringify({status: status, result: result, error: result.error_message, completed_at: Date.now()}), {expirationTtl: 604800});
        break;
      }
    } catch (error) {
      console.error(`Polling error for ${taskId}:`, error);
    }
  }
}

function handleCORS() {
  return new Response(null, {headers: {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Max-Age": "86400"}});
}

function addCORSHeaders(response) {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", "*");
  return newResponse;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {status, headers: {"Content-Type": "application/json; charset=utf-8"}});
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}