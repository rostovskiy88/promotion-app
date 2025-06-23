import { CloudOutlined, ExclamationCircleOutlined, SyncOutlined, WifiOutlined } from '@ant-design/icons';
import { Alert, Button, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCache } from '../../hooks/useRedux';
import styles from './OfflineIndicator.module.css';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, offlineQueue, syncErrors, hasBeenOfflineSession } = useCache();
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

  useEffect(() => {
    if (isOnline && hasBeenOfflineSession && !isSyncing) {
      setShowReconnectedMessage(true);
      const timer = setTimeout(() => {
        setShowReconnectedMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (!isOnline) {
      setShowReconnectedMessage(false);
    }
  }, [isOnline, isSyncing, hasBeenOfflineSession]);

  if (isOnline && !showReconnectedMessage && !isSyncing) {
    return null;
  }

  return (
    <div className={styles.container}>
      {!isOnline && (
        <Alert
          message={
            <Space>
              <WifiOutlined style={{ color: '#ff4d4f' }} />
              <span>You are currently offline</span>
              {offlineQueue.length > 0 && <Tag color='warning'>{offlineQueue.length} actions queued</Tag>}
            </Space>
          }
          description='Some features may be limited. Your changes will sync when connection is restored.'
          type='warning'
          className={`${styles.alert} offline-notification`}
          showIcon={false}
          role='alert'
          aria-live='polite'
          closable={true}
        />
      )}

      {isSyncing && (
        <Alert
          message={
            <Space>
              <SyncOutlined spin />
              <span>Syncing data...</span>
            </Space>
          }
          description='Updating your content with the latest changes.'
          type='info'
          className={styles.alert}
          showIcon={false}
        />
      )}

      {showReconnectedMessage && isOnline && (
        <Alert
          message={
            <Space>
              <CloudOutlined style={{ color: '#52c41a' }} />
              <span>Connection restored</span>
            </Space>
          }
          description='All features are now available.'
          type='success'
          className={styles.alert}
          showIcon={false}
          closable={true}
        />
      )}

      {syncErrors.length > 0 && (
        <Alert
          message={
            <Space>
              <ExclamationCircleOutlined />
              <span>Sync failed</span>
            </Space>
          }
          description={`${syncErrors.length} items failed to sync. Please try again.`}
          type='error'
          className={styles.alert}
          showIcon={false}
          action={
            <Button size='small' type='text' danger>
              Retry
            </Button>
          }
        />
      )}
    </div>
  );
};

export default OfflineIndicator;
