import React, { useEffect } from 'react';
import { Button, Select, Pagination } from 'antd';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import NoArticles from '../../components/NoArticles/NoArticles';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';
import { useUserDisplayInfo } from '../../hooks/useUserDisplayInfo';
import styles from './Dashboard.module.css';
import { formatArticleDate } from '../../utils/formatArticleDate';
import { addSampleArticles } from '../../utils/addSampleArticles';
import { useArticles, useUI } from '../../hooks/useRedux';

const { Option } = Select;

const categories = ['All Categories', 'Productivity', 'Media', 'Business'];
const sortOptions = ['Ascending', 'Descending'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const userDisplayInfo = useUserDisplayInfo();
  
  // 🔥 NOW USING REDUX INSTEAD OF LOCAL STATE!
  const {
    articles: allArticles,
    filteredArticles,
    loading,
    error,
    selectedCategory,
    sortOrder,
    searchTerm, // 🎯 Using Redux search term instead of context
    isSearching: reduxIsSearching,
    currentPage,
    articlesPerPage,
    currentPageArticles,
    paginationInfo,
    fetchArticles,
    searchArticles,
    deleteArticle,
    setCategory,
    setSortOrder,
    setPage,
    clearError
  } = useArticles();
  
  const { setGlobalLoading } = useUI();

  useEffect(() => {
    // Initial fetch using Redux
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    // Handle errors with Redux UI (just clear them for now)
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleCategoryChange = (category: string) => {
    setCategory(category); // Redux action - this will reset page and trigger refetch
    // Manually trigger the appropriate fetch after category change
    if (searchTerm.trim()) {
      searchArticles(searchTerm, category, sortOrder);
    } else {
      fetchArticles(category, sortOrder);
    }
  };

  const handleSortChange = (sort: 'Ascending' | 'Descending') => {
    setSortOrder(sort); // Redux action
    // Manually trigger the appropriate fetch after sort change
    if (searchTerm.trim()) {
      searchArticles(searchTerm, selectedCategory, sort);
    } else {
      fetchArticles(selectedCategory, sort);
    }
  };

  const handleEdit = (articleId: string) => {
    navigate(`/dashboard/edit-article/${articleId}`);
  };

  const handleDelete = async (articleId: string) => {
    try {
      setGlobalLoading(true); // Redux UI loading
      await deleteArticle(articleId); // Redux async thunk
    } catch (error) {
      console.error('Failed to delete article:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleAddSampleArticles = async () => {
    try {
      setGlobalLoading(true);
      await addSampleArticles();
      fetchArticles(); // Refresh via Redux
    } catch (error) {
      console.error('Failed to add sample articles:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const getDisplayTitle = () => {
    if (searchTerm.trim()) {
      return `Search Results for "${searchTerm}"`;
    }
    return 'Articles Dashboard';
  };

  const getResultsCount = () => {
    const { totalCount, startItem, endItem } = paginationInfo;
    
    if (searchTerm.trim()) {
      return (
        <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }}>
          {totalCount} article{totalCount !== 1 ? 's' : ''} found
          {totalCount > 0 && ` • Showing ${startItem}-${endItem}`}
        </span>
      );
    }
    
    if (totalCount > 0) {
      return (
        <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }}>
          Showing {startItem}-{endItem} of {totalCount} articles
        </span>
      );
    }
    
    return null;
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    // Scroll to top of articles section when page changes
    document.querySelector(`.${styles.articlesSection}`)?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Articles Section */}
      <div className={styles.articlesSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div>
              <h2 style={{ margin: 0 }}>{getDisplayTitle()}</h2>
              {getResultsCount()}
            </div>
            <span style={{ color: '#b0b4ba', fontWeight: 500 }}>
              Show: <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
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
              onChange={handleSortChange}
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
        
        {loading || reduxIsSearching ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>Loading...</div>
        ) : paginationInfo.totalCount === 0 ? (
          searchTerm.trim() ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <h3>No articles found for "{searchTerm}"</h3>
              <p style={{ color: '#666' }}>Try adjusting your search terms or browse all articles.</p>
            </div>
          ) : (
            <NoArticles />
          )
        ) : (
          <div className={styles.articlesGrid}>
            {currentPageArticles.map(article => (
              <ArticleCard
                key={article.id}
                category={article.category ?? ''}
                date={formatArticleDate(
                  typeof article.createdAt === 'string' 
                    ? new Date(article.createdAt) 
                    : article.createdAt.toDate()
                )}
                title={article.title}
                description={article.content ?? ''}
                authorName={userDisplayInfo.displayName || 'Anonymous'}
                authorAvatar={userDisplayInfo.avatarUrl}
                readMoreUrl={`/dashboard/article/${article.id}`}
                imageUrl={typeof article.imageUrl === 'string' ? article.imageUrl : 'https://via.placeholder.com/400x200'}
                onEdit={() => article.id && handleEdit(article.id)}
                onDelete={() => article.id && handleDelete(article.id)}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {paginationInfo.hasMultiplePages && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Pagination
              current={currentPage}
              total={paginationInfo.totalCount}
              pageSize={articlesPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={paginationInfo.totalCount > 50}
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} articles`
              }
              size="default"
              style={{ userSelect: 'none' }}
            />
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