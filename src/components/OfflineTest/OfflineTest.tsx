import React from 'react';
import { Button, Card, Space, Tag } from 'antd';
import { WifiOutlined, SyncOutlined } from '@ant-design/icons';
import { useCache } from '../../hooks/useRedux';
import { OfflineQueueItem } from '../../types/firebase';

const OfflineTest: React.FC = () => {
  const { isOnline, isSyncing, offlineQueue, setOnline, setSyncing, addToQueue } = useCache();

  const simulateOffline = () => {
    setOnline(false);
  };

  const simulateOnline = () => {
    setOnline(true);
  };

  const addTestAction = () => {
    addToQueue('TEST_ACTION', { message: 'Test offline action', timestamp: Date.now() });
  };

  const simulateSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 3000);
  };

  return (
    <Card title="🔧 Offline Functionality Test" style={{ margin: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <strong>Current Status:</strong>
          <Space style={{ marginLeft: 8 }}>
            <Tag color={isOnline ? 'green' : 'red'}>
              <WifiOutlined /> {isOnline ? 'Online' : 'Offline'}
            </Tag>
            {isSyncing && (
              <Tag color="processing">
                <SyncOutlined spin /> Syncing
              </Tag>
            )}
            <Tag color="blue">
              Queue: {offlineQueue.length} items
            </Tag>
          </Space>
        </div>

        <Space wrap>
          <Button 
            onClick={simulateOffline} 
            disabled={!isOnline}
            danger
          >
            Simulate Offline
          </Button>
          
          <Button 
            onClick={simulateOnline} 
            disabled={isOnline}
            type="primary"
          >
            Simulate Online
          </Button>
          
          <Button onClick={addTestAction}>
            Add Test Action to Queue
          </Button>
          
          <Button 
            onClick={simulateSync}
            disabled={isSyncing}
            icon={<SyncOutlined />}
          >
            Simulate Sync
          </Button>
        </Space>

        {offlineQueue.length > 0 && (
          <div>
            <strong>Queued Actions:</strong>
            <ul style={{ marginTop: 8 }}>
              {offlineQueue.map((item: OfflineQueueItem) => (
                <li key={item.id}>
                  {item.action} - {new Date(item.timestamp).toLocaleTimeString()}
                  {item.retries > 0 && <Tag color="orange">Retries: {item.retries}</Tag>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default OfflineTest; 