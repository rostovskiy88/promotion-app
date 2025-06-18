import { MoreOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Modal, Skeleton, Typography } from 'antd';
import React, { useState } from 'react';
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
  authorId: string;
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
  authorId: _authorId,
  readMoreUrl,
  imageUrl,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Add confirmation before delete
  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this article?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        onDelete && onDelete();
      },
    });
  };

  const menu = {
    items: [
      {
        key: 'edit',
        label: 'Edit',
        onClick: onEdit,
        'data-testid': 'edit-button',
      },
      {
        key: 'delete',
        label: 'Delete',
        onClick: handleDelete,
        'data-testid': 'delete-button',
      },
    ],
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(readMoreUrl);
  };

  return (
    <div className='article-card' data-testid='article-card'>
      <div className='article-card-image' style={{ position: 'relative', background: '#f7f8fa' }}>
        {!imageLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f7f8fa',
              zIndex: 1,
            }}
          >
            <Skeleton.Image style={{ width: '100%', height: '100%', minHeight: 240, borderRadius: 0 }} active />
          </div>
        )}
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imageLoaded ? 'block' : 'none',
            borderRadius: 'inherit',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        <div className='article-dropdown-wrapper'>
          <Dropdown menu={menu} trigger={['click']} placement='bottomRight'>
            <MoreOutlined className='article-card-menu' />
          </Dropdown>
        </div>
      </div>
      <div className='article-card-content'>
        <div className='article-card-meta'>
          <Text className='article-card-category'>{category}</Text>
          <Text className='article-card-date'>{date}</Text>
        </div>
        <Title level={4} className='article-card-title'>
          {title}
        </Title>
        <Text className='article-card-description'>{description}</Text>
        <div className='article-card-footer'>
          <Avatar src={authorAvatar} size={32} />
          <Text className='article-card-author'>{authorName}</Text>
          <button
            className='article-card-readmore'
            onClick={handleReadMore}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1557ff',
              fontWeight: 500,
              fontSize: '15px',
              textDecoration: 'none',
              marginLeft: 'auto',
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
