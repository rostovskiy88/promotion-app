import React, { useEffect } from 'react';
import { Card, Button, Switch, Select, Tag, Space, Divider } from 'antd';
import { BellOutlined, CloudOutlined, DatabaseOutlined, SettingOutlined } from '@ant-design/icons';
import { useArticles, useUI, useCache, useAuth, useAppState } from '../../hooks/useRedux';

const { Option } = Select;

/**
 * This component demonstrates how to use Redux store throughout the app
 * with our new multi-slice architecture
 */
const ReduxUsageExample: React.FC = () => {
  // Individual slice hooks
  const articles = useArticles();
  const ui = useUI();
  const cache = useCache();
  const auth = useAuth();
  
  // Combined app state hook
  const appState = useAppState();

  // Example: Fetch articles on component mount
  useEffect(() => {
    articles.fetchArticles();
  }, []);

  // Example: Theme switching
  const handleThemeChange = (checked: boolean) => {
    ui.setTheme(checked ? 'dark' : 'light');
  };

  // Example: Show notification
  const showExampleNotification = () => {
    ui.showNotification('success', 'Redux is working!', 'All slices are properly configured');
  };

  // Example: Cache some data
  const cacheExampleData = () => {
    cache.cacheData('example-key', { message: 'This is cached data', timestamp: Date.now() }, 10000);
  };

  // Example: Search articles
  const handleSearch = (value: string) => {
    if (value) {
      articles.searchArticles(value);
    } else {
      articles.clearSearch();
    }
  };

  // Example: Open modal
  const openExampleModal = () => {
    ui.openModal('example-modal', 'Redux Modal Example', 'This modal is managed by Redux!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Redux Multi-Slice Architecture Demo</h2>
      
      {/* Auth State */}
      <Card title="🔐 Auth State" style={{ marginBottom: '16px' }}>
        <p><strong>User:</strong> {auth.userDisplayName}</p>
        <p><strong>Authenticated:</strong> {auth.isAuthenticated ? '✅' : '❌'}</p>
        <p><strong>Email Verified:</strong> {auth.hasVerifiedEmail ? '✅' : '❌'}</p>
        <p><strong>Loading:</strong> {auth.loading ? 'Yes' : 'No'}</p>
      </Card>

      {/* Articles State */}
      <Card title="📝 Articles State" style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Tag color="blue">Total Articles: {articles.articles.length}</Tag>
          <Tag color="green">Filtered: {articles.filteredArticles.length}</Tag>
          <Tag color="orange">Page: {articles.currentPage}</Tag>
          <Tag color="purple">Category: {articles.selectedCategory}</Tag>
        </Space>
        <Divider />
        <Space>
          <Button onClick={() => articles.fetchArticles()}>
            Refresh Articles
          </Button>
          <Select
            placeholder="Search articles..."
            style={{ width: 200 }}
            showSearch
            allowClear
            onSearch={handleSearch}
            onClear={() => articles.clearSearch()}
          >
            <Option value="react">React</Option>
            <Option value="typescript">TypeScript</Option>
            <Option value="redux">Redux</Option>
          </Select>
          <Select
            value={articles.selectedCategory}
            onChange={articles.setCategory}
            style={{ width: 150 }}
          >
            <Option value="All Categories">All Categories</Option>
            <Option value="Technology">Technology</Option>
            <Option value="Business">Business</Option>
            <Option value="Science">Science</Option>
          </Select>
        </Space>
      </Card>

      {/* UI State */}
      <Card title="🎨 UI State" style={{ marginBottom: '16px' }}>
        <Space direction="vertical">
          <div>
            <strong>Theme:</strong>{' '}
            <Switch 
              checked={ui.theme === 'dark'} 
              onChange={handleThemeChange}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
            <span style={{ marginLeft: '8px' }}>
              Current: {ui.theme}
            </span>
          </div>
          
          <div>
            <strong>Global Loading:</strong>{' '}
            <Switch 
              checked={ui.globalLoading}
              onChange={ui.setGlobalLoading}
            />
          </div>
          
          <div>
            <strong>Sidebar Collapsed:</strong> {ui.sidebarCollapsed ? 'Yes' : 'No'}
          </div>
          
          <Space>
            <Button icon={<BellOutlined />} onClick={showExampleNotification}>
              Show Notification
            </Button>
            <Button icon={<SettingOutlined />} onClick={openExampleModal}>
              Open Modal
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Cache State */}
      <Card title="💾 Cache State" style={{ marginBottom: '16px' }}>
        <Space direction="vertical">
          <div>
            <Space>
              <Tag color={cache.isOnline ? 'green' : 'red'}>
                <CloudOutlined /> {cache.isOnline ? 'Online' : 'Offline'}
              </Tag>
              <Tag color={cache.isSyncing ? 'processing' : 'default'}>
                {cache.isSyncing ? 'Syncing...' : 'Sync Complete'}
              </Tag>
              <Tag color="blue">
                <DatabaseOutlined /> Cache Entries: {Object.keys(cache.apiCache).length}
              </Tag>
            </Space>
          </div>
          
          <div>
            <strong>Performance Metrics:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li>API Calls: {cache.metrics.apiCalls}</li>
              <li>Cache Hits: {cache.metrics.cacheHits}</li>
              <li>Cache Misses: {cache.metrics.cacheMisses}</li>
              <li>Avg Response Time: {cache.metrics.avgResponseTime.toFixed(2)}ms</li>
            </ul>
          </div>
          
          <Space>
            <Button onClick={cacheExampleData}>
              Cache Example Data
            </Button>
            <Button onClick={() => cache.setOnline(!cache.isOnline)}>
              Toggle Online Status
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Combined App State */}
      <Card title="🌐 Combined App State" style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Tag color={appState.isLoading ? 'processing' : 'success'}>
            Loading: {appState.isLoading ? 'Yes' : 'No'}
          </Tag>
          <Tag color={appState.hasErrors ? 'error' : 'success'}>
            Has Errors: {appState.hasErrors ? 'Yes' : 'No'}
          </Tag>
          <Tag color={appState.isOffline ? 'warning' : 'success'}>
            Offline Mode: {appState.isOffline ? 'Yes' : 'No'}
          </Tag>
        </Space>
      </Card>

      <Card title="📋 Usage Examples" type="inner">
        <h4>How to Use These Redux Slices:</h4>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`// In any component:
import { useArticles, useUI, useAuth } from '../hooks/useRedux';

const MyComponent = () => {
  const articles = useArticles();
  const ui = useUI();
  const auth = useAuth();
  
  // Fetch articles
  articles.fetchArticles('Technology', 'Descending');
  
  // Show notification
  ui.showNotification('success', 'Hello World!');
  
  // Check auth status
  if (auth.isAuthenticated) {
    // User is logged in
  }
  
  return <div>...</div>;
};`}
        </pre>
      </Card>
    </div>
  );
};

export default ReduxUsageExample; 