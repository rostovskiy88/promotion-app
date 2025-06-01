import httpClient from './httpClient';

// Example API service showing different HTTP methods
export const apiService = {
  // GET request example
  async getPublicData(endpoint: string) {
    try {
      const response = await httpClient.get(`https://jsonplaceholder.typicode.com/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch public data:', error);
      throw error;
    }
  },

  // POST request example
  async createPost(data: { title: string; body: string; userId: number }) {
    try {
      const response = await httpClient.post('https://jsonplaceholder.typicode.com/posts', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  },

  // PUT request example
  async updatePost(id: number, data: { title: string; body: string; userId: number }) {
    try {
      const response = await httpClient.put(`https://jsonplaceholder.typicode.com/posts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  },

  // DELETE request example
  async deletePost(id: number) {
    try {
      await httpClient.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  },

  // Weather API (moved from WeatherWidget for centralization)
  async getWeatherByCoords(lat: number, lon: number) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    try {
      const response = await httpClient.get(url);
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
      const response = await httpClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to search cities:', error);
      throw error;
    }
  }
}; 