// API Base Configuration
const API_BASE_URL = 'http://localhost:4000';

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
    if (!path.startsWith('/')) path = '/' + path;
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
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return { success: true, data };
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) {
      throw new ApiError(`HTTP Error: ${response.status} - ${response.statusText}`, response.status);
    }
    const data = await response.json();
    return { success: true, data };
  }

  async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
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
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
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

export default apiClient;
