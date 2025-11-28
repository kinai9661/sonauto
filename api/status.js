// api/status.js
import { getTask, updateTaskStatus } from '../lib/kv.js';
import { SonautoClient } from '../lib/sonauto.js';
import { corsHeaders, handleCORS } from '../lib/utils.js';

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
    let task = await getTask(task_id);

    if (!task) {
      return res.status(404).set(corsHeaders()).json({
        error: '任務不存在'
      });
    }

    // 如果任務未完成，嘗試更新狀態
    if (task.status !== 'SUCCESS' && task.status !== 'FAILURE') {
      try {
        const client = new SonautoClient(process.env.SONAUTO_API_KEY);
        const status = await client.getStatus(task_id);
        
        if (status === 'SUCCESS' || status === 'FAILURE') {
          const result = await client.getResult(task_id);
          task = await updateTaskStatus(task_id, status, {
            result: result,
            error: result.error_message,
            completed_at: Date.now()
          });
        } else {
          task = await updateTaskStatus(task_id, status);
        }
      } catch (updateError) {
        console.error('Status update error:', updateError);
      }
    }

    res.status(200).set(corsHeaders()).json({
      task_id,
      status: task.status,
      updated_at: task.updated_at || task.created_at
    });

  } catch (error) {
    console.error('Status error:', error);
    res.status(500).set(corsHeaders()).json({
      error: error.message
    });
  }
}