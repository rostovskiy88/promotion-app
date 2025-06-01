import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Avatar, Dropdown, Divider } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SearchOutlined,
  DownOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import styles from './AuthenticatedLayout.module.css';
import Logo from '../Logo/Logo';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';
import { useSearch } from '../../contexts/SearchContext';

const { Header, Sider, Content } = Layout;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const firestoreUser = useFirestoreUser();
  const { searchTerm, setSearchTerm, clearSearch } = useSearch();
  const [inputValue, setInputValue] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [inputValue, setSearchTerm]);

  // Sync input value with search term when search is cleared
  useEffect(() => {
    if (searchTerm === '') {
      setInputValue('');
    }
  }, [searchTerm]);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    // Add more menu items here if needed
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchClear = () => {
    setInputValue('');
    clearSearch();
  };

  const userMenuItems = [
    {
      key: 'edit-profile',
      label: 'Edit profile',
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light" className={styles.sider}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <div className={styles.sectionTitle}>Main Menu</div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', background: 'transparent', marginTop: 16 }}
        />
        <Divider style={{ margin: '24px 0 0 0' }} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', height: 64, padding: '0 24px' }}>
          <Input
            placeholder="Find articles..."
            prefix={<SearchOutlined />}
            suffix={inputValue ? <CloseOutlined onClick={handleSearchClear} style={{ cursor: 'pointer' }} /> : null}
            className={styles.searchInput}
            style={{ width: 340, marginRight: 24 }}
            value={inputValue}
            onChange={handleSearchChange}
          />
          <div style={{ flex: 1 }} />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar src={firestoreUser?.avatarUrl || undefined}>
                {!firestoreUser?.avatarUrl && (firestoreUser?.firstName?.[0] || user?.displayName?.[0] || user?.email?.[0] || <UserOutlined />)}
              </Avatar>
              <span style={{ color: '#1557ff', fontWeight: 500 }}>
                {firestoreUser
                  ? `${firestoreUser.firstName || ''} ${firestoreUser.lastName || ''}`.trim() || user?.displayName || user?.email
                  : user?.displayName || user?.email}
              </span>
              <DownOutlined style={{ fontSize: 12, color: '#b0b4ba' }} />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 280, borderRadius: 4 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AuthenticatedLayout; 