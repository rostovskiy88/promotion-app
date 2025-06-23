import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Avatar, Button, message, Spin, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';
import { getArticleById } from '../../services/articleService';
import { Article } from '../../types/article';

const { Title, Paragraph, Text } = Typography;

const ArticleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size='large' />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const isAuthor = currentUser?.uid === article.authorId;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} type='default'>
          Back to Dashboard
        </Button>

        {isAuthor && (
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/edit-article/${article.id}`)}
            type='primary'
          >
            Edit Article
          </Button>
        )}
      </div>

      <div
        style={{
          padding: '32px',
          background: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}
      >
        {article.imageUrl && typeof article.imageUrl === 'string' && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          {article.category && (
            <Tag
              color='blue'
              style={{
                marginBottom: '12px',
                fontSize: '12px',
                padding: '4px 12px',
              }}
            >
              {article.category.toUpperCase()}
            </Tag>
          )}

          <Title
            level={1}
            style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              lineHeight: '1.2',
            }}
          >
            {article.title}
          </Title>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <Avatar src={article.authorAvatar} size={32}>
              {article.authorName.charAt(0)}
            </Avatar>
            <div>
              <Text strong style={{ color: 'var(--text-primary)' }}>
                {article.authorName}
              </Text>
              <br />
              <Text style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {new Date(
                  typeof article.createdAt === 'string' ? article.createdAt : article.createdAt.toDate()
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: 'var(--text-primary)',
          }}
        >
          <Paragraph
            style={{
              fontSize: '16px',
              marginBottom: '24px',
              color: 'var(--text-primary)',
            }}
          >
            {article.content}
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;
