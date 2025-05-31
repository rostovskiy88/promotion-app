import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Select, message } from 'antd';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import NoArticles from '../../components/NoArticles/NoArticles';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';
import { getArticles, deleteArticle } from '../../services/articleService';
import { Article } from '../../types/article';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';
import styles from './Dashboard.module.css';
import { formatArticleDate } from '../../utils/formatArticleDate';

const { Option } = Select;

const categories = ['All Categories', 'Productivity', 'Media', 'Business'];
const sortOptions = ['Ascending', 'Descending'];

const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState('Ascending');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const firestoreUser = useFirestoreUser();

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await getArticles(selectedCategory);
      setArticles(fetchedArticles as Article[]);
    } catch (error) {
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (articleId: string) => {
    navigate(`/dashboard/edit-article/${articleId}`);
  };

  const handleDelete = async (articleId: string) => {
    try {
      await deleteArticle(articleId);
      message.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      message.error('Failed to delete article');
    }
  };

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
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>Loading...</div>
        ) : articles.length === 0 ? (
          <NoArticles />
        ) : (
          <div className={styles.articlesGrid}>
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                category={article.category ?? ''}
                date={formatArticleDate(article.createdAt.toDate())}
                title={article.title}
                description={article.content ?? ''}
                authorName={firestoreUser ? `${firestoreUser.firstName || ''} ${firestoreUser.lastName || ''}`.trim() : ''}
                authorAvatar={firestoreUser ? firestoreUser.avatarUrl || '' : ''}
                readMoreUrl={`/dashboard/article/${article.id}`}
                imageUrl={typeof article.imageUrl === 'string' ? article.imageUrl : 'https://via.placeholder.com/400x200'}
                onEdit={() => handleEdit(article.id)}
                onDelete={() => handleDelete(article.id)}
              />
            ))}
          </div>
        )}
      </Col>
      {/* Right Sidebar */}
      <Col flex="300px" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Button type="primary" block style={{ marginBottom: 16 }} onClick={() => navigate('/dashboard/add-article')}>
          + Add Article
        </Button>
        <WeatherWidget />
      </Col>
    </Row>
  );
};

export default Dashboard;