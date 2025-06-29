import { MoreOutlined } from '@ant-design/icons';
import { AutoComplete, Card, Dropdown, message, Modal, Spin, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './WeatherWidget.css';

const { Title, Text } = Typography;

interface CityOption {
  value: string;
  label: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualCity, setManualCity] = useState<CityOption | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputCity, setInputCity] = useState('');
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn('OpenWeather API key not configured');
        setError('Weather service not configured');
        setLoading(false);
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

      const response = await axios.get(url);
      setWeather(response.data);
    } catch (e: any) {
      console.warn('Weather API error:', e.message);
      if (e.message?.includes('CORS') || e.message?.includes('Network Error')) {
        setError('Weather temporarily unavailable');
      } else {
        setError('Unable to load weather data');
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCityOption = async (city: CityOption) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWeatherByCoords(city.lat, city.lon);
    } catch (e: any) {
      setError('Unable to load weather data.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'auto') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          },
          () => {
            setError('Location access denied.');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
        setLoading(false);
      }
    } else if (mode === 'manual' && manualCity) {
      fetchWeatherByCityOption(manualCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, manualCity]);

  const handleCitySearch = async (value: string) => {
    setInputCity(value);
    if (!value.trim()) {
      setCityOptions([]);
      return;
    }
    setSearching(true);
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(value)}&limit=5&appid=${apiKey}`;

      const response = await axios.get(url);
      const options: CityOption[] = response.data.map((item: any) => ({
        value: `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`,
        label: `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state,
      }));
      setCityOptions(options);
    } catch (e) {
      setCityOptions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'manual') {
      setModalVisible(true);
    } else if (key === 'auto') {
      setMode('auto');
      setManualCity(null);
    }
  };

  const handleModalOk = () => {
    if (!manualCity) {
      message.error('Please select a city from the list.');
      return;
    }
    setMode('manual');
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className='weather-widget' variant='outlined' styles={{ body: { padding: 24 } }}>
      <div className='weather-widget-header'>
        <Text className='weather-widget-label'>WEATHER WIDGET</Text>
        <Dropdown
          menu={{
            items: [
              { key: 'manual', label: 'Select City Manually' },
              { key: 'auto', label: 'Auto-detect My Location' },
            ],
            onClick: handleMenuClick,
          }}
          trigger={['click']}
          placement='bottomRight'
        >
          <MoreOutlined className='weather-widget-menu' style={{ cursor: 'pointer' }} />
        </Dropdown>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <Spin />
        </div>
      ) : error ? (
        <div style={{ color: 'red', margin: '32px 0', textAlign: 'center' }}>{error}</div>
      ) : weather && weather.main ? (
        <>
          <div className='weather-widget-date-block'>
            <Title level={3} className='weather-widget-date'>
              {dateStr}
            </Title>
            <Text className='weather-widget-day'>{dayName}</Text>
          </div>
          <div className='weather-widget-temp-block'>
            <span className='weather-widget-temp'>{Math.round(weather.main.temp)}</span>
            <span className='weather-widget-degree'>°C</span>
            <img
              className='weather-widget-icon'
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              style={{ marginLeft: 16, width: 48, height: 48 }}
            />
          </div>
          <div className='weather-widget-location'>
            {weather.name}, {weather.sys.country}
          </div>
        </>
      ) : null}
      <Modal
        title='Select City Manually'
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText='Set City'
        cancelText='Cancel'
        closable={false}
      >
        <AutoComplete
          style={{ width: '100%' }}
          options={cityOptions}
          value={inputCity}
          onSearch={handleCitySearch}
          onSelect={(_, option) => {
            setManualCity(option as CityOption);
            setInputCity(option.value);
          }}
          placeholder='Enter city name'
          notFoundContent={searching ? <Spin size='small' /> : null}
          filterOption={false}
        />
      </Modal>
    </Card>
  );
};

export default WeatherWidget;
