import React from 'react';
import { RocketOutlined } from '@ant-design/icons';
import styles from './Logo.module.css';

interface LogoProps {
  collapsed?: boolean;
  variant?: 'default' | 'light';
}

const Logo: React.FC<LogoProps> = ({ collapsed, variant = 'default' }) => {
  const logoClass = variant === 'light' ? `${styles.logo} ${styles.logoLight}` : styles.logo;
  return (
    <div className={logoClass}>
      <RocketOutlined className={styles.icon} />
      {!collapsed && <span className={styles.text}>olegpromo</span>}
    </div>
  );
};

export default Logo;
