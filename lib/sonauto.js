// lib/sonauto.js - Sonauto API 客戶端
const SONAUTO_API_BASE = 'https://api.sonauto.ai/v1';

export class SonautoClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async generate(params) {
    const response = await fetch(`${SONAUTO_API_BASE}/generations`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`Sonauto API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getStatus(taskId) {
    const response = await fetch(
      `${SONAUTO_API_BASE}/generations/status/${taskId}`,
      { headers: this.headers }
    );
    
    if (!response.ok) {
      throw new Error(`Status API error: ${response.statusText}`);
    }
    
    return (await response.text()).replace(/"/g, '');
  }

  async getResult(taskId) {
    const response = await fetch(
      `${SONAUTO_API_BASE}/generations/${taskId}`,
      { headers: this.headers }
    );
    
    if (!response.ok) {
      throw new Error(`Result API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async extend(params) {
    const response = await fetch(`${SONAUTO_API_BASE}/generations/extend`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`Extend API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async inpaint(params) {
    const response = await fetch(`${SONAUTO_API_BASE}/generations/inpaint`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`Inpaint API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getBalance() {
    const response = await fetch(`${SONAUTO_API_BASE}/credits/balance`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`Balance API error: ${response.statusText}`);
    }
    
    return response.json();
  }
}