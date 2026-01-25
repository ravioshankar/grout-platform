import { Platform } from 'react-native';
import { getSetting } from './database';

// For Android emulator: use 10.0.2.2 (special alias for host machine)
// For iOS simulator and web: use localhost
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8888';
  }
  return 'http://localhost:8888';
};

const API_BASE_URL = getApiBaseUrl();

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
      try {
        const token = await getSetting('auth_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
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
    if (requiresAuth && mergedHeaders['Authorization']) {
      console.log('Auth token present:', mergedHeaders['Authorization'].substring(0, 20) + '...');
    }
    
    const response = await fetch(url, {
      ...restConfig,
      headers: mergedHeaders,
    }).catch(err => {
      console.error('Fetch error:', err);
      console.error('Failed URL:', url);
      throw new Error(`Cannot connect to server at ${this.baseURL}. Error: ${err.message}`);
    });

    if (!response.ok) {
      if (response.status === 401 && requiresAuth) {
        const { deleteSetting } = await import('./database');
        await deleteSetting('auth_token');
        await deleteSetting('refresh_token');
        throw new Error('Session expired. Please login again.');
      }
      
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      console.log('API Error Response:', JSON.stringify(error));
      
      if (error.detail && Array.isArray(error.detail)) {
        const firstError = error.detail[0];
        const errorMsg = String(firstError.msg || 'Validation error');
        throw new Error(errorMsg);
      }
      
      const errorMsg = String(error.message || error.detail || `HTTP ${response.status}: ${response.statusText}`);
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
