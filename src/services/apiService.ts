import axios, { AxiosResponse } from 'axios';
import { store } from '../store';
import { incrementApiCalls, updateResponseTime } from '../store/slices/cacheSlice';

const client = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

client.interceptors.request.use(
  config => {
    const startTime = Date.now();
    config.metadata = { startTime };
    store.dispatch(incrementApiCalls());

    return config;
  },
  error => {
    console.error('❌ Request failed:', error);
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response: AxiosResponse) => {
    const endTime = Date.now();
    const startTime = response.config.metadata?.startTime || endTime;
    const responseTime = endTime - startTime;

    store.dispatch(updateResponseTime(responseTime));

    console.log(`✅ [${response.status}] ${response.config.url} (${responseTime}ms)`);

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

    return Promise.reject(error);
  }
);

// Real API service for the React Promotion app
export const apiService = {
  // Weather API (centralized weather service - alternative to direct axios in WeatherWidget)
  async getWeatherByCoords(lat: number, lon: number) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      throw error;
    }
  },

  // City search API
  async searchCities(query: string) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;

    try {
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to search cities:', error);
      throw error;
    }
  },
};

declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
