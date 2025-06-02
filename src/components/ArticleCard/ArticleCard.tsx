import React from 'react';
import { Dropdown, Avatar, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  const menu = {
    items: [
      { key: 'edit', label: 'Edit', onClick: onEdit },
      { key: 'delete', label: 'Delete', onClick: onDelete },
    ],
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(readMoreUrl);
  };

  return (
    <div className="article-card">
      <div className="article-card-image" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="article-dropdown-wrapper">
          <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
            <MoreOutlined className="article-card-menu" />
          </Dropdown>
        </div>
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
          <button 
            className="article-card-readmore" 
            onClick={handleReadMore}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#1557ff',
              fontWeight: 500,
              fontSize: '15px',
              textDecoration: 'none',
              marginLeft: 'auto'
            }}
          >
            Read more →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard; 