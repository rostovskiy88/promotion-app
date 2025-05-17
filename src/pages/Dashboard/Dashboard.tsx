import React, { useState } from 'react';
import { Row, Col, Button, Select } from 'antd';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import NoArticles from '../../components/NoArticles/NoArticles';

const { Option } = Select;

const categories = ['All Categories', 'Productivity', 'Media', 'Business'];
const sortOptions = ['Ascending', 'Descending'];

const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState('Ascending');
  const articles: any[] = [];

  return (
    <Row gutter={24}>
      {/* Main Content: Articles */}
      <Col flex="auto">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <h2 style={{ margin: 0 }}>Articles Dashboard</h2>
            <span style={{ color: '#b0b4ba', fontWeight: 500 }}>
              Show: <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                variant="borderless"
                style={{ fontWeight: 600, color: '#222', minWidth: 140 }}
                dropdownStyle={{ minWidth: 180 }}
              >
                {categories.map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>
            </span>
          </div>
          <span style={{ background: '#fff', borderRadius: 6, padding: '8px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#b0b4ba', fontWeight: 500 }}>Sort by:</span>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              variant="borderless"
              style={{ fontWeight: 700, color: '#222', minWidth: 100, marginLeft: 4 }}
              dropdownStyle={{ minWidth: 140 }}
            >
              {sortOptions.map(opt => (
                <Option key={opt} value={opt}>{opt}</Option>
              ))}
            </Select>
          </span>
        </div>
        {articles.length === 0 && <NoArticles />}
      </Col>
      {/* Right Sidebar */}
      <Col flex="300px" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Button type="primary" block style={{ marginBottom: 16 }}>
          + Add Article
        </Button>
        <WeatherWidget />
      </Col>
    </Row>
  );
};

export default Dashboard;