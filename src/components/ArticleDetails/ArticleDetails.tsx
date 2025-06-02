import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message, Tag, Avatar } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Article } from '../../types/article';
import { getArticleById } from '../../services/articleService';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';

const { Title, Paragraph, Text } = Typography;

const ArticleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Using route params as required
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const firestoreUserData = useFirestoreUser();
  const { refresh, ...currentUser } = firestoreUserData;

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        message.error('Article ID not provided');
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const articleData = await getArticleById(id);
        if (articleData) {
          setArticle(articleData);
        } else {
          message.error('Article not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        message.error('Failed to load article');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]);

  // Prevent render without data
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return null; // Will be redirected
  }

  // Check if current user is the author
  const isAuthor = currentUser?.uid === article.authorId;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header with back button and edit button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard')}
          type="default"
        >
          Back to Dashboard
        </Button>
        
        {isAuthor && (
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/dashboard/edit-article/${article.id}`)}
            type="primary"
          >
            Edit Article
          </Button>
        )}
      </div>
      
      <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
        {/* Article Image */}
        {article.imageUrl && typeof article.imageUrl === 'string' && (
          <div style={{ marginBottom: '24px' }}>
            <img 
              src={article.imageUrl} 
              alt={article.title}
              style={{ 
                width: '100%', 
                maxHeight: '300px', 
                objectFit: 'cover',
                borderRadius: '8px'
              }} 
            />
          </div>
        )}

        {/* Article Header */}
        <div style={{ marginBottom: '24px' }}>
          {article.category && (
            <Tag color="blue" style={{ marginBottom: '12px', fontSize: '12px', padding: '4px 12px' }}>
              {article.category.toUpperCase()}
            </Tag>
          )}
          
          <Title level={1} style={{ margin: '0 0 16px 0', fontSize: '32px', lineHeight: '1.2' }}>
            {article.title}
          </Title>
          
          {/* Author and Date Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666' }}>
            <Avatar src={article.authorAvatar} size={32}>
              {article.authorName.charAt(0)}
            </Avatar>
            <div>
              <Text strong style={{ color: '#333' }}>{article.authorName}</Text>
              <br />
              <Text style={{ fontSize: '14px', color: '#666' }}>
                {new Date(
                  typeof article.createdAt === 'string' 
                    ? article.createdAt 
                    : article.createdAt.toDate()
                ).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
          <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
            {article.content}
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ArticleDetails; 