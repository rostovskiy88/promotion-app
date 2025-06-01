import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Article } from '../../types/article';
import { getArticleById } from '../../services/articleService';

const { Title, Paragraph } = Typography;

const ArticleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Using route params as required
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '20px' }}
      >
        Back to Dashboard
      </Button>
      
      <Card>
        <Title level={1}>{article.title}</Title>
        <Paragraph>
          <strong>Category:</strong> {article.category}
        </Paragraph>
        <Paragraph>
          <strong>Author:</strong> {article.authorName}
        </Paragraph>
        <Paragraph>
          <strong>Created:</strong> {new Date(
            typeof article.createdAt === 'string' 
              ? article.createdAt 
              : article.createdAt.toDate()
          ).toLocaleDateString()}
        </Paragraph>
        <div style={{ marginTop: '20px' }}>
          <Paragraph>{article.content}</Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ArticleDetails; 