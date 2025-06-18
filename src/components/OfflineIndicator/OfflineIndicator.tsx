import React, { useEffect, useState } from 'react';
import { Alert, Button, Space, Tag } from 'antd';
import { WifiOutlined, SyncOutlined, CloudOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCache } from '../../hooks/useRedux';
import styles from './OfflineIndicator.module.css';

const OfflineIndicator: React.FC = () => {
  try {
    const { isOnline, isSyncing, offlineQueue, syncErrors, hasBeenOfflineSession } = useCache();
    const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

    useEffect(() => {
      // Only show reconnection message if we were previously offline during this session
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

    // Don't render anything if online and no messages to show
    if (isOnline && !showReconnectedMessage && !isSyncing) {
      return null;
    }

    return (
      <div className={styles.container}>
        {/* Offline Notification */}
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
          />
        )}

        {/* Syncing Notification */}
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

        {/* Reconnected Notification */}
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
          />
        )}

        {/* Sync Errors */}
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
  } catch (error) {
    console.warn('OfflineIndicator failed to render:', error);
    // Return minimal offline indicator using browser API
    return navigator.onLine ? null : (
      <Alert
        message='You are currently offline'
        type='warning'
        showIcon={false}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}
      />
    );
  }
};

export default OfflineIndicator;
