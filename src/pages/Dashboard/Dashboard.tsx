import React from 'react';
import { Row, Col, Button } from 'antd';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';

const Dashboard: React.FC = () => {
  return (
    <Row gutter={24}>
      {/* Main Content: Articles */}
      <Col flex="auto">
        <h2>Articles Dashboard</h2>
        {/* TODO: Add search bar, filter, and <ArticlesList /> here */}
      </Col>
      {/* Right Sidebar */}
      <Col flex="300px">
        <Button type="primary" block style={{ marginBottom: 16 }}>
          + Add Article
        </Button>
        <WeatherWidget />
      </Col>
    </Row>
  );
};

export default Dashboard;