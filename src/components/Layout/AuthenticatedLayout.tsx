import {
  BulbOutlined,
  CloseOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, Layout, Menu, Switch } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useArticles, useUI } from '../../hooks/useRedux';
import { useUserDisplayInfo } from '../../hooks/useUserDisplayInfo';
import { logout } from '../../services/authService';
import Logo from '../Logo/Logo';
import styles from './AuthenticatedLayout.module.css';

const { Header, Content, Sider } = Layout;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();

  const userDisplayInfo = useUserDisplayInfo();

  const { theme, globalLoading, sidebarCollapsed, toggleTheme, setSidebarCollapsed } = useUI();

  const { setSearchTerm: setReduxSearchTerm, clearSearch: clearReduxSearch } = useArticles();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleSidebarToggle = (collapsed: boolean) => {
    setCollapsed(collapsed);
    setSidebarCollapsed(collapsed);
  };

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
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  const userMenu = {
    items: [
      {
        key: 'theme',
        label: (
          <div className={styles.themeMenuItem} onClick={e => e.stopPropagation()}>
            <BulbOutlined />
            <span>Dark Mode</span>
            <Switch size='small' checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
        ),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to='/dashboard/profile'>Profile</Link>,
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
      label: <Link to='/dashboard'>Dashboard</Link>,
    },
    {
      key: '/dashboard/add-article',
      icon: <FileTextOutlined />,
      label: <Link to='/dashboard/add-article'>Add Article</Link>,
    },
  ];

  const selectedKeys = [location.pathname];

  return (
    <Layout className={styles.mainLayout}>
      <Sider collapsible collapsed={collapsed} onCollapse={handleSidebarToggle} className={styles.sider}>
        <div className={styles.logo}>
          <Logo collapsed={collapsed} />
        </div>
        <Menu theme='dark' mode='inline' selectedKeys={selectedKeys} items={menuItems} />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            {location.pathname === '/dashboard' && (
              <div className={styles.searchContainer}>
                <Input
                  placeholder='Find articles...'
                  value={inputValue}
                  onChange={handleInputChange}
                  data-testid='search-input'
                  className={styles.searchInput}
                  prefix={<SearchOutlined />}
                  suffix={
                    inputValue ? (
                      <Button
                        type='text'
                        size='small'
                        icon={<CloseOutlined />}
                        onClick={handleClearSearch}
                        data-testid='search-clear'
                        className={styles.searchClearButton}
                      />
                    ) : null
                  }
                />
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {globalLoading && <div className={styles.loadingIndicator}>Loading...</div>}

            <Dropdown menu={userMenu} placement='bottomRight' trigger={['click']}>
              <div className={styles.userSection}>
                <Avatar src={userDisplayInfo.avatarUrl} icon={<UserOutlined />} className={styles.avatar} />
                <span className={styles.username}>{userDisplayInfo.displayName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T & { cancel: () => void } {
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
