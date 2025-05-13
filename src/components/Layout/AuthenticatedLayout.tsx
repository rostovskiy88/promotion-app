import React from 'react';
import { Layout, Menu, Input, Avatar, Dropdown, Divider } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import styles from './AuthenticatedLayout.module.css';
import Logo from '../Logo/Logo';

const { Header, Sider, Content } = Layout;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

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

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
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
      <Sider width={200} theme="light">
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
            className={styles.searchInput}
            style={{ width: 480, marginRight: 24, marginLeft: 10 }}
          />
          <div style={{ flex: 1 }} />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={user?.photoURL || undefined} />
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>{user?.displayName || user?.email}</span>
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