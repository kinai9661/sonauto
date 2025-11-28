// api/inpaint.js
import { SonautoClient } from '../lib/sonauto.js';
import { saveTask } from '../lib/kv.js';
import { corsHeaders } from '../lib/utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders()).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).set(corsHeaders()).json({ error: 'Method not allowed' });
  }

  try {
    const client = new SonautoClient(process.env.SONAUTO_API_KEY);
    
    const payload = {
      audio_url: req.body.audio_url,
      audio_base64: req.body.audio_base64,
      sections: req.body.sections,
      lyrics: req.body.lyrics,
      tags: req.body.tags,
      prompt: req.body.prompt,
      selection_crop: req.body.selection_crop || false,
      output_format: req.body.output_format || 'mp3'
    };

    const data = await client.inpaint(payload);
    const taskId = data.task_id;

    await saveTask(taskId, {
      status: 'RECEIVED',
      type: 'inpaint',
      created_at: Date.now()
    });

    res.status(200).set(corsHeaders()).json({
      task_id: taskId,
      status: 'RECEIVED'
    });

  } catch (error) {
    console.error('Inpaint error:', error);
    res.status(500).set(corsHeaders()).json({
      error: error.message
    });
  }
}