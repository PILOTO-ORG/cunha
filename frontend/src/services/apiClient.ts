// API Base Configuration
declare const process: {
  env: {
    REACT_APP_API_URL?: string;
  };
};

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/api$/, '')
  : window.location.origin;

function getToken(): string | null {
  return localStorage.getItem('jwt');
}

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
    
    console.log(`[ApiClient] GET ${url}`);
    if (params) console.log(`[ApiClient] GET params:`, params);
    
    const token = getToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, { method: 'GET', headers });
    
    console.log(`[ApiClient] GET ${url} - Status: ${response.status}`);
    
    if (response.status === 401) {
      console.warn(`[ApiClient] GET ${url} - Unauthorized, redirecting to login`);
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      console.error(`[ApiClient] GET ${url} - Error: ${response.status} ${response.statusText}`);
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    console.log(`[ApiClient] GET ${url} - Response:`, data);
    return { success: true, data };
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    
    console.log(`[ApiClient] POST ${url}`);
    if (body) console.log(`[ApiClient] POST body:`, body);
    
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    console.log(`[ApiClient] POST ${url} - Status: ${response.status}`);
    
    if (response.status === 401) {
      console.warn(`[ApiClient] POST ${url} - Unauthorized, redirecting to login`);
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ApiClient] POST ${url} - Error: ${response.status} ${response.statusText}`, errorText);
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    console.log(`[ApiClient] POST ${url} - Response:`, data);
    return { success: true, data };
  }

  async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
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
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
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
    
    console.log(`[ApiClient] PATCH ${url}`);
    if (body) console.log(`[ApiClient] PATCH body:`, body);
    
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    console.log(`[ApiClient] PATCH ${url} - Status: ${response.status}`);
    
    if (response.status === 401) {
      console.warn(`[ApiClient] PATCH ${url} - Unauthorized, redirecting to login`);
      window.location.href = '/login';
      return { success: false, data: undefined as any, error: 'Unauthorized' };
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ApiClient] PATCH ${url} - Error: ${response.status} ${response.statusText}`, errorText);
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    console.log(`[ApiClient] PATCH ${url} - Response:`, data);
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

// Legacy apiRequest function for backward compatibility
async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  // Garantir que o path tenha o prefixo /api se não for uma URL completa
  const fullPath = path.startsWith('http') ? path : (path.startsWith('/api/') ? path : `/api${path}`);
  const url = `${API_BASE_URL}${fullPath}`;
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    window.location.href = '/login';
    return null;
  }
  
  return response.json();
}

export default apiRequest;


