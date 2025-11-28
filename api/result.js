// api/result.js
import { getTask } from '../lib/kv.js';
import { corsHeaders } from '../lib/utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders()).send('');
  }

  const { task_id } = req.query;

  if (!task_id) {
    return res.status(400).set(corsHeaders()).json({
      error: '缺少 task_id 參數'
    });
  }

  try {
    const task = await getTask(task_id);

    if (!task) {
      return res.status(404).set(corsHeaders()).json({
        error: '任務不存在'
      });
    }

    if (task.status !== 'SUCCESS') {
      return res.status(202).set(corsHeaders()).json({
        status: task.status,
        message: task.status === 'FAILURE' ? '任務失敗' : '任務處理中',
        error: task.error
      });
    }

    res.status(200).set(corsHeaders()).json({
      task_id,
      status: 'SUCCESS',
      song_urls: task.result.song_paths,
      lyrics: task.result.lyrics,
      completed_at: task.completed_at
    });

  } catch (error) {
    console.error('Result error:', error);
    res.status(500).set(corsHeaders()).json({
      error: error.message
    });
  }
}