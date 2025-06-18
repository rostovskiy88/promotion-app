import React from 'react';
import { Button, Result } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className='not-found-container'>
      <div className='not-found-content'>
        <div className='not-found-illustration'>
          <div className='error-code'>404</div>
          <div className='error-icon'>
            <SearchOutlined />
          </div>
        </div>

        <Result
          status='404'
          title={<span className='error-title'>Oops! Page Not Found</span>}
          subTitle={
            <span className='error-subtitle'>
              The page you're looking for seems to have wandered off into the digital void. Don't worry, even the best
              explorers sometimes take a wrong turn!
            </span>
          }
          extra={
            <div className='error-actions'>
              <Button
                type='primary'
                size='large'
                icon={<HomeOutlined />}
                onClick={handleGoHome}
                className='home-button'
              >
                Go to Dashboard
              </Button>
              <Button size='large' icon={<ArrowLeftOutlined />} onClick={handleGoBack} className='back-button'>
                Go Back
              </Button>
            </div>
          }
        />

        <div className='error-suggestions'>
          <h3>What you can do:</h3>
          <ul>
            <li>Check if the URL is typed correctly</li>
            <li>
              Visit our{' '}
              <button onClick={handleGoHome} className='link-button'>
                Dashboard
              </button>{' '}
              to find what you're looking for
            </li>
            <li>Use the search feature to find articles</li>
            <li>Go back to the previous page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
