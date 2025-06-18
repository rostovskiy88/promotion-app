import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { setCacheEntry, getCacheEntry, incrementApiCalls, updateResponseTime } from '../store/slices/cacheSlice';

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor with Redux integration
    this.client.interceptors.request.use(
      config => {
        const startTime = Date.now();
        config.metadata = { startTime }; // Store start time for performance metrics

        // Increment API calls counter in Redux
        store.dispatch(incrementApiCalls());

        console.log(`🔄 [${config.method?.toUpperCase()}] ${config.url}`);
        return config;
      },
      error => {
        console.error('❌ Request failed:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with caching and metrics
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const endTime = Date.now();
        const startTime = response.config.metadata?.startTime || endTime;
        const responseTime = endTime - startTime;

        // Update performance metrics in Redux
        store.dispatch(updateResponseTime(responseTime));

        console.log(`✅ [${response.status}] ${response.config.url} (${responseTime}ms)`);

        // Auto-cache GET requests
        if (response.config.method === 'get' && response.config.url) {
          const cacheKey = this.generateCacheKey(response.config);
          const cacheEntry = {
            key: cacheKey,
            data: response.data,
            expiresIn: 5 * 60 * 1000, // 5 minutes default
          };
          store.dispatch(setCacheEntry(cacheEntry));
        }

        return response;
      },
      error => {
        const endTime = Date.now();
        const startTime = error.config?.metadata?.startTime || endTime;
        const responseTime = endTime - startTime;

        store.dispatch(updateResponseTime(responseTime));

        console.error(
          `❌ [${error.response?.status || 'NETWORK'}] ${error.config?.url} (${responseTime}ms)`,
          error.message
        );

        // Handle different error types
        if (error.response?.status === 401) {
          console.error('🔒 Unauthorized request - redirecting to login');
          // Could dispatch logout action here
        } else if (error.response?.status >= 500) {
          console.error('🔥 Server error');
        }

        return Promise.reject(error);
      }
    );
  }

  private generateCacheKey(config: AxiosRequestConfig): string {
    const { url, params } = config;
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }

  // Check cache before making request
  private async checkCache(config: AxiosRequestConfig): Promise<any | null> {
    if (config.method !== 'get') return null;

    const cacheKey = this.generateCacheKey(config);
    const state = store.getState();
    const cacheEntry = state.cache.apiCache[cacheKey];

    if (cacheEntry) {
      const now = Date.now();
      if (now - cacheEntry.timestamp < cacheEntry.expiresIn) {
        console.log(`💾 Cache hit for: ${cacheKey}`);
        return cacheEntry.data;
      }
    }

    return null;
  }

  // Enhanced request method with caching
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const requestConfig = { ...config, url, method: 'get' as const };

    // Check cache first
    const cachedData = await this.checkCache(requestConfig);
    if (cachedData) {
      return cachedData;
    }

    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Manual cache control
  setCacheEntry(key: string, data: any, expiresIn?: number) {
    store.dispatch(setCacheEntry({ key, data, expiresIn }));
  }

  getCacheEntry(key: string) {
    store.dispatch(getCacheEntry(key));
  }
}

// Create singleton instance
export const httpClient = new HttpClient();
export default httpClient;

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
