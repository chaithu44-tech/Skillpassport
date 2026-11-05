// Skill Passport API Client
const API_BASE = '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('skill_passport_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('skill_passport_token', token);
    } else {
      localStorage.removeItem('skill_passport_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('skill_passport_token');
  }

  getHeaders(isMultipart = false) {
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async handleResponse(response) {
    if (response.status === 401) {
      // Auto-clear invalid session token
      this.setToken(null);
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMsg = 'An unexpected server error occurred.';
      if (typeof data === 'object' && data !== null) {
        if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (data.message) {
          errorMsg = data.message;
        }
      }
      throw new Error(errorMsg);
    }
    return data;
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${window.location.origin}${API_BASE}${endpoint}`);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url.searchParams.append(k, params[k]);
      }
    });
    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse(resp);
  }

  async post(endpoint, body = {}) {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse(resp);
  }

  async put(endpoint, body = {}) {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse(resp);
  }

  async patch(endpoint, body = {}) {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse(resp);
  }

  async delete(endpoint) {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(resp);
  }

  async upload(endpoint, formData) {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData
    });
    return this.handleResponse(resp);
  }
}

export const api = new ApiClient();
