// api/generate.js
import { SonautoClient } from '../lib/sonauto.js';
import { saveTask } from '../lib/kv.js';
import { corsHeaders, handleCORS } from '../lib/utils.js';

export default async function handler(req, res) {
  // CORS 處理
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders()).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).set(corsHeaders()).json({ error: 'Method not allowed' });
  }

  try {
    const client = new SonautoClient(process.env.SONAUTO_API_KEY);
    
    const payload = {
      prompt: req.body.prompt,
      lyrics: req.body.lyrics,
      tags: req.body.tags,
      instrumental: req.body.instrumental || false,
      num_songs: req.body.num_songs || 1,
      output_format: req.body.output_format || 'mp3',
      prompt_strength: req.body.prompt_strength || 2.3,
      balance_strength: req.body.balance_strength || 0.7,
      bpm: req.body.bpm,
    };

    // 移除空值
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

    const data = await client.generate(payload);
    const taskId = data.task_id;

    // 保存任務到 KV
    await saveTask(taskId, {
      status: 'RECEIVED',
      type: 'generate',
      created_at: Date.now(),
      params: req.body
    });

    res.status(200).set(corsHeaders()).json({
      task_id: taskId,
      status: 'RECEIVED',
      message: '任務已創建，正在處理中'
    });

  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).set(corsHeaders()).json({
      error: error.message
    });
  }
}