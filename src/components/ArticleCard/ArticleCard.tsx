import React from 'react';
import { Card, Dropdown, Menu, Avatar, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import './ArticleCard.css';

const { Title, Text } = Typography;

export interface ArticleCardProps {
  category: string;
  date: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar: string;
  readMoreUrl: string;
  imageUrl: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  category,
  date,
  title,
  description,
  authorName,
  authorAvatar,
  readMoreUrl,
  imageUrl,
  onEdit,
  onDelete,
}) => {
  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={onEdit}>Edit</Menu.Item>
      <Menu.Item key="delete" onClick={onDelete}>Delete</Menu.Item>
    </Menu>
  );

  return (
    <Card className="article-card" bodyStyle={{ padding: 0 }}>
      <div className="article-card-image" style={{ backgroundImage: `url(${imageUrl})` }}>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <MoreOutlined className="article-card-menu" />
        </Dropdown>
      </div>
      <div className="article-card-content">
        <div className="article-card-meta">
          <Text className="article-card-category">{category}</Text>
          <Text className="article-card-date">{date}</Text>
        </div>
        <Title level={4} className="article-card-title">{title}</Title>
        <Text className="article-card-description">{description}</Text>
        <div className="article-card-footer">
          <Avatar src={authorAvatar} size={32} />
          <Text className="article-card-author">{authorName}</Text>
          <a className="article-card-readmore" href={readMoreUrl}>Read more →</a>
        </div>
      </div>
    </Card>
  );
};

export default ArticleCard; 