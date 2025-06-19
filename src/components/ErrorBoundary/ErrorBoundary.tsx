import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary-container'>
          <div className='error-boundary-content'>
            <div className='error-illustration'>
              <div className='error-icon-large'>
                <BugOutlined />
              </div>
              <div className='error-waves'>
                <div className='wave wave1'></div>
                <div className='wave wave2'></div>
                <div className='wave wave3'></div>
              </div>
            </div>

            <Result
              status='500'
              title={<span className='error-title'>Oops! Something went wrong</span>}
              subTitle={
                <div className='error-subtitle'>
                  <p>We encountered an unexpected error. This has been logged and our team will look into it.</p>
                  <p>Please try refreshing the page or go back to the dashboard.</p>
                </div>
              }
              extra={
                <div className='error-actions'>
                  <Button
                    type='primary'
                    size='large'
                    icon={<ReloadOutlined />}
                    onClick={this.handleReload}
                    className='reload-button'
                  >
                    Reload Page
                  </Button>
                  <Button size='large' icon={<HomeOutlined />} onClick={this.handleGoHome} className='home-button'>
                    Go to Dashboard
                  </Button>
                </div>
              }
            />

            {process.env.NODE_ENV === 'development' && (
              <details className='error-details'>
                <summary>Error Details (Development Only)</summary>
                <div className='error-info'>
                  <h4>Error:</h4>
                  <pre>{this.state.error?.toString()}</pre>

                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo?.componentStack}</pre>

                  <h4>Error Stack:</h4>
                  <pre>{this.state.error?.stack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
