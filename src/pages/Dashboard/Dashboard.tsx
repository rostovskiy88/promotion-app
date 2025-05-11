import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import styles from './Dashboard.module.css';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }: DashboardProps) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      onClick: async () => {
        await dispatch(logout());
        navigate('/login');
      },
    },
  ];

  const sideMenuItems = [
    {
      key: 'articles',
      label: 'Articles',
      onClick: () => navigate('/dashboard/articles'),
    },
    {
      key: 'create',
      label: 'Create Article',
      onClick: () => navigate('/dashboard/articles/create'),
    },
  ];

  return (
    <Layout className={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Logo collapsed={collapsed} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['articles']}
          items={sideMenuItems}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: styles.trigger,
            onClick: () => setCollapsed(!collapsed),
          })}
          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard; 