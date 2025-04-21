import React from 'react';
import { RocketOutlined } from '@ant-design/icons';
import styles from './Logo.module.css';

interface LogoProps {
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed }) => {
  return (
    <div className={styles.logo}>
      <RocketOutlined className={styles.icon} />
      {!collapsed && <span className={styles.text}>olegpromo</span>}
    </div>
  );
};

export default Logo; 