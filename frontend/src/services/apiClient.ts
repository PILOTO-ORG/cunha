
// import removido: jwtFetch
declare const process: {
  env: {
    REACT_APP_API_URL?: string;
  };
};
// Serviço de API para frontend com JWT
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('jwt');
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const resp = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (resp.status === 401) {
    window.location.href = '/login';
    return null;
  }
  return resp.json();
}

export default apiRequest;
// API Base Configuration
const API_BASE_URL = (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') : 'http://localhost:4000');

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) return path;
    // Garante que todas rotas usem /api como prefixo
    if (!path.startsWith('/')) path = '/' + path;
    if (!path.startsWith('/api/')) path = '/api' + path;
    return this.baseURL.replace(/\/$/, '') + path;
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = this.buildUrl(path);
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }
    const token = getToken();
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    if (response.status === 401) {
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return { success: true, data };
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (response.status === 401) {
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return { success: true, data };
  }

  async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (response.status === 401) {
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return { success: true, data };
  }

  async delete<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = this.buildUrl(path);
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }
    const token = getToken();
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'DELETE', headers });
    if (response.status === 401) {
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return { success: true, data };
  }

  async patch<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (response.status === 401) {
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return { success: true, data };
  }
}

// Singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Custom Error class
export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}


