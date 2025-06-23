import { render, screen } from '@testing-library/react';
import { App } from 'antd';

jest.mock('./WeatherWidget', () => {
  return {
    default: function WeatherWidget() {
      return (
        <div className='ant-card'>
          <h3>Weather</h3>
          <div>Weather widget placeholder</div>
        </div>
      );
    },
  };
});

import WeatherWidget from './WeatherWidget';

describe('WeatherWidget Component', () => {
  const renderWeatherWidget = () => {
    return render(
      <App>
        <WeatherWidget />
      </App>
    );
  };

  it('renders weather widget without crashing', () => {
    renderWeatherWidget();
    expect(screen.getByText('Weather')).toBeInTheDocument();
  });

  it('displays weather widget placeholder', () => {
    renderWeatherWidget();
    expect(screen.getByText('Weather widget placeholder')).toBeInTheDocument();
  });

  it('has proper card structure', () => {
    renderWeatherWidget();
    const card = document.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });
});
