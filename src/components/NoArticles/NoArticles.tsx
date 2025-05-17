import React from 'react';
import { Empty } from 'antd';

const NoArticles: React.FC = () => (
  <div style={{ padding: '48px 0', textAlign: 'center' }}>
    <Empty description="No articles found" />
  </div>
);

export default NoArticles; 