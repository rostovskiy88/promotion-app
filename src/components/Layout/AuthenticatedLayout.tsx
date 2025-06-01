import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Input, Button, Avatar, Dropdown, Switch, Badge } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SearchOutlined,
  CloseOutlined,
  BulbOutlined,
  BellOutlined
} from '@ant-design/icons';
import { logout } from '../../services/authService';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';
import { useUI, useAuth, useArticles } from '../../hooks/useRedux';
import styles from './AuthenticatedLayout.module.css';

const { Header, Content, Sider } = Layout;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const firestoreUser = useFirestoreUser();
  
  // Redux hooks
  const auth = useAuth();
  const { 
    theme, 
    notifications, 
    globalLoading,
    sidebarCollapsed,
    toggleTheme,
    setSidebarCollapsed,
    clearNotifications
  } = useUI();
  
  const { setSearchTerm: setReduxSearchTerm, clearSearch: clearReduxSearch } = useArticles();

  // Sync Redux sidebar state with local state
  useEffect(() => {
    setCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleSidebarToggle = (collapsed: boolean) => {
    setCollapsed(collapsed);
    setSidebarCollapsed(collapsed);
  };

  // Debounced search - updates Redux
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setReduxSearchTerm(value);
    }, 300),
    [setReduxSearchTerm]
  );

  useEffect(() => {
    debouncedSearch(inputValue);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  // Clear search when navigating away from dashboard
  useEffect(() => {
    if (!location.pathname.includes('/dashboard')) {
      clearReduxSearch();
      setInputValue('');
    }
  }, [location.pathname, clearReduxSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClearSearch = () => {
    setInputValue('');
    clearReduxSearch();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userMenu = {
    items: [
      {
        key: 'theme',
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BulbOutlined />
            <span>Dark Mode</span>
            <Switch 
              size="small"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </div>
        ),
      },
      {
        key: 'notifications',
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge count={notifications.length} size="small">
              <BellOutlined />
            </Badge>
            <span>Notifications</span>
            {notifications.length > 0 && (
              <Button 
                size="small" 
                type="link" 
                onClick={clearNotifications}
                style={{ padding: 0, height: 'auto' }}
              >
                Clear
              </Button>
            )}
          </div>
        ),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/dashboard/profile">Profile</Link>,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/dashboard/add-article',
      icon: <FileTextOutlined />,
      label: <Link to="/dashboard/add-article">Add Article</Link>,
    },
  ];

  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={handleSidebarToggle}
        className={styles.sider}
      >
        <div className={styles.logo}>
          <span>RP</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            {location.pathname === '/dashboard' && (
              <div className={styles.searchContainer}>
                <Input
                  placeholder="Find articles..."
                  value={inputValue}
                  onChange={handleInputChange}
                  style={{ 
                    width: 340, 
                    marginRight: 24,
                    borderRadius: '20px',
                    background: '#f7f8fa',
                    border: 'none',
                    fontSize: '16px',
                    height: '40px'
                  }}
                  prefix={<SearchOutlined />}
                  suffix={
                    inputValue ? (
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={handleClearSearch}
                        style={{ 
                          border: 'none', 
                          background: 'transparent',
                          height: '32px',
                          width: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          margin: 0
                        }}
                      />
                    ) : null
                  }
                />
              </div>
            )}
          </div>
          
          <div className={styles.headerRight}>
            {/* Global Loading Indicator */}
            {globalLoading && (
              <div style={{ marginRight: '16px', color: '#1890ff' }}>
                Loading...
              </div>
            )}
            
            {/* Notifications Badge */}
            <Badge count={notifications.length} style={{ marginRight: '16px' }}>
              <BellOutlined style={{ fontSize: '16px', color: '#666' }} />
            </Badge>
            
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <div className={styles.userSection}>
                <Avatar 
                  src={firestoreUser?.avatarUrl} 
                  icon={<UserOutlined />}
                  className={styles.avatar}
                />
                <span className={styles.username}>
                  {auth.userDisplayName}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

export default AuthenticatedLayout; 