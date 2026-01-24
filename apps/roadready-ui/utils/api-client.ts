import { getSetting } from './database';

const API_BASE_URL = 'http://127.0.0.1:8888';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getHeaders(requiresAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = await getSetting('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { requiresAuth = true, headers: customHeaders, ...restConfig } = config;

    const headers = await this.getHeaders(requiresAuth);
    const mergedHeaders = { ...headers, ...customHeaders };

    const url = `${this.baseURL}${endpoint}`;
    
    console.log('API Request:', restConfig.method || 'GET', url);
    
    const response = await fetch(url, {
      ...restConfig,
      headers: mergedHeaders,
    }).catch(err => {
      console.error('Fetch error:', err);
      throw new Error(`Cannot connect to server. Please ensure the API is running at ${this.baseURL}`);
    });

    if (!response.ok) {
      if (response.status === 401 && requiresAuth) {
        const { deleteSetting } = await import('./database');
        await deleteSetting('auth_token');
        await deleteSetting('refresh_token');
        throw new Error('Session expired. Please login again.');
      }
      
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      console.log('API Error Response:', JSON.stringify(error));
      
      if (error.detail && Array.isArray(error.detail)) {
        const firstError = error.detail[0];
        const errorMsg = firstError.msg || 'Validation error';
        console.log('Extracted validation error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      const errorMsg = error.message || error.detail || 'Request failed';
      console.log('Extracted error:', errorMsg);
      throw new Error(errorMsg);
    }

    return response.json();
  }

  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T>(endpoint: string, data?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async patch<T>(endpoint: string, data?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async put<T>(endpoint: string, data?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
