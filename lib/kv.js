// lib/kv.js - Vercel KV 存儲封裝
import { kv } from '@vercel/kv';

const TTL = 604800; // 7 天

export async function saveTask(taskId, data) {
  await kv.set(taskId, JSON.stringify(data), { ex: TTL });
}

export async function getTask(taskId) {
  const data = await kv.get(taskId);
  return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
}

export async function updateTaskStatus(taskId, status, additionalData = {}) {
  const existing = await getTask(taskId);
  const updated = {
    ...existing,
    status,
    updated_at: Date.now(),
    ...additionalData
  };
  await saveTask(taskId, updated);
  return updated;
}

export async function deleteTask(taskId) {
  await kv.del(taskId);
}