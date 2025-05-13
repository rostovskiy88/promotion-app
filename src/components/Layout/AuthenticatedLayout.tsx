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
    <Layout className={styles.layout}>
      <Sider className={styles.sider} width={200} theme="light">
        <div className={styles.logo}>
          <Logo />
        </div>
        <div className={styles.sectionTitle}>Main Menu</div>
        <Menu
          className={styles.menu}
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
        <Divider className={styles.menuDivider} />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <Input
            placeholder="Find articles..."
            prefix={<SearchOutlined />}
            className={styles.searchInput}
          />
          <div style={{ flex: 1 }} />
          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} src={user?.photoURL || undefined} />
                <span className={styles.userName}>{user?.displayName || user?.email}</span>
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

export default AuthenticatedLayout; 