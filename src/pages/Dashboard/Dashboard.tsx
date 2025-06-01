import React, { useState, useEffect } from 'react';
import { Button, Select, message } from 'antd';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import NoArticles from '../../components/NoArticles/NoArticles';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';
import { getArticles, deleteArticle } from '../../services/articleService';
import { Article } from '../../types/article';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';
import styles from './Dashboard.module.css';
import { formatArticleDate } from '../../utils/formatArticleDate';
import { addSampleArticles } from '../../utils/addSampleArticles';

const { Option } = Select;

const categories = ['All Categories', 'Productivity', 'Media', 'Business'];
const sortOptions = ['Ascending', 'Descending'];

const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Descending');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const firestoreUser = useFirestoreUser();

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, sortOrder]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await getArticles(selectedCategory, sortOrder);
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

  const handleAddSampleArticles = async () => {
    try {
      await addSampleArticles();
      message.success('Sample articles added successfully!');
      fetchArticles();
    } catch (error) {
      message.error('Failed to add sample articles');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Articles Section */}
      <div className={styles.articlesSection}>
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
                authorName={firestoreUser ? `${firestoreUser.firstName || ''} ${firestoreUser.lastName || ''}`.trim() || 'Anonymous' : 'Anonymous'}
                authorAvatar={firestoreUser?.avatarUrl || ''}
                readMoreUrl={`/dashboard/article/${article.id}`}
                imageUrl={typeof article.imageUrl === 'string' ? article.imageUrl : 'https://via.placeholder.com/400x200'}
                onEdit={() => article.id && handleEdit(article.id)}
                onDelete={() => article.id && handleDelete(article.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Widget Section */}
      <div className={styles.widgetSection}>
        <div className={styles.rightSidebar}>
          <Button type="primary" block onClick={() => navigate('/dashboard/add-article')}>
            + Add Article
          </Button>
          <Button type="default" block onClick={handleAddSampleArticles}>
            Add Sample Articles
          </Button>
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;