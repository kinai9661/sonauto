// api/balance.js
import { SonautoClient } from '../lib/sonauto.js';
import { corsHeaders } from '../lib/utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders()).send('');
  }

  try {
    const client = new SonautoClient(process.env.SONAUTO_API_KEY);
    const balance = await client.getBalance();

    res.status(200).set(corsHeaders()).json(balance);

  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).set(corsHeaders()).json({
      error: error.message
    });
  }
}