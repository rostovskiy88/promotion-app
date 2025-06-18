import httpClient from './httpClient';

// Real API service for the React Promotion app
export const apiService = {
  // Weather API (centralized weather service - alternative to direct axios in WeatherWidget)
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
  },
};
