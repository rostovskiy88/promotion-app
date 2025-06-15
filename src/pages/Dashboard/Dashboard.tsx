import React, { useEffect, useState } from 'react';
import { Button, Select, Pagination, Spin } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import NoArticles from '../../components/NoArticles/NoArticles';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';
import { useUserDisplayInfo } from '../../hooks/useUserDisplayInfo';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import styles from './Dashboard.module.css';
import { formatArticleDate } from '../../utils/formatArticleDate';
import { addSampleArticles } from '../../utils/addSampleArticles';
import { useArticles, useUI } from '../../hooks/useRedux';
import { Article } from '../../types/article';

const { Option } = Select;

const categories = ['All Categories', 'Productivity', 'Media', 'Business'];
const sortOptions = ['Ascending', 'Descending'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const userDisplayInfo = useUserDisplayInfo();
  const [isAtTop, setIsAtTop] = useState(true);
  
  // 🔥 NOW USING REDUX WITH LAZY LOADING!
  const {
    articles, // Main articles for infinite scroll
    loading,
    loadingMore,
    hasMore,
    error,
    selectedCategory,
    sortOrder,
    searchTerm,
    isSearching: reduxIsSearching,
    
    // Search pagination (for search results only)
    currentPage,
    currentPageSearchArticles,
    searchPaginationInfo,
    
    // Actions
    fetchArticles,
    loadMoreArticles,
    searchArticles,
    deleteArticle,
    setCategory,
    setSortOrder,
    setPage,
    clearError
  } = useArticles();
  
  const { setGlobalLoading } = useUI();

  // Track scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsAtTop(scrollTop < 100); // Hide button when within 100px of top
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize articles on component mount
  useEffect(() => {
    fetchArticles(selectedCategory, sortOrder, true);
  }, []);

  // Handle searchTerm changes - THIS WAS MISSING!
  useEffect(() => {
    if (searchTerm.trim()) {
      // If there's a search term, perform search
      searchArticles(searchTerm, selectedCategory, sortOrder);
    } else {
      // If search term is cleared, go back to main articles
      fetchArticles(selectedCategory, sortOrder, true);
    }
  }, [searchTerm]);

  // Handle category or sort changes
  useEffect(() => {
    // When category or sort changes, we need to reset and refetch
    if (searchTerm.trim()) {
      // If searching, update search results
      searchArticles(searchTerm, selectedCategory, sortOrder);
    } else {
      // Otherwise, reset and fetch new articles
      fetchArticles(selectedCategory, sortOrder, true);
    }
  }, [selectedCategory, sortOrder]);

  // Set up infinite scrolling for main articles view
  useInfiniteScroll({
    hasMore: hasMore && !searchTerm.trim(), // Only for main view, not search
    loading: loadingMore,
    onLoadMore: () => {
      if (!searchTerm.trim()) {
        loadMoreArticles(selectedCategory, sortOrder);
      }
    },
    threshold: 300
  });

  useEffect(() => {
    // Handle errors with Redux UI (just clear them for now)
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleCategoryChange = (category: string) => {
    setCategory(category); // This will trigger the useEffect above
  };

  const handleSortChange = (sort: 'Ascending' | 'Descending') => {
    setSortOrder(sort); // This will trigger the useEffect above
  };

  const handleEdit = (articleId: string) => {
    navigate(`/dashboard/edit-article/${articleId}`);
  };

  const handleDelete = async (articleId: string) => {
    try {
      setGlobalLoading(true);
      await deleteArticle(articleId);
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
      // Reset and refetch articles after adding samples
      fetchArticles(selectedCategory, sortOrder, true);
    } catch (error) {
      console.error('Failed to add sample articles:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  const getDisplayTitle = () => {
    if (searchTerm.trim()) {
      return `Search Results for "${searchTerm}"`;
    }
    return 'Articles Dashboard';
  };

  const getResultsCount = () => {
    if (searchTerm.trim()) {
      const { totalCount, startItem, endItem } = searchPaginationInfo;
      return (
        <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }} data-testid="results-count">
          {totalCount} article{totalCount !== 1 ? 's' : ''} found
          {totalCount > 0 && ` • Showing ${startItem}-${endItem}`}
        </span>
      );
    }
    
    // For main articles view (infinite scroll)
    const totalLoaded = articles.length;
    if (totalLoaded > 0) {
      return (
        <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }} data-testid="results-count">
          {totalLoaded} article{totalLoaded !== 1 ? 's' : ''} loaded
          {hasMore && ' • Scroll for more'}
        </span>
      );
    }
    
    return null;
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    // Scroll to top of articles section when page changes (search results only)
    document.querySelector(`.${styles.articlesSection}`)?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  // Determine which articles to show
  const articlesToDisplay = searchTerm.trim() ? currentPageSearchArticles : articles;
  const isSearchMode = searchTerm.trim();
  const showPagination = isSearchMode && searchPaginationInfo.hasMultiplePages;
  const showScrollToTop = !isSearchMode && articles.length > 6 && !isAtTop; // Show when more than one chunk loaded AND not at top

  return (
    <div className={styles.dashboardContainer}>
      {/* Sticky Scroll to top button */}
      {showScrollToTop && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<UpOutlined />}
          onClick={scrollToTop}
          data-testid="scroll-to-top"
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '56px',
            width: '56px',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            border: 'none',
            zIndex: 1000
          }}
          title="Scroll to top"
        />
      )}

      {/* Articles Section */}
      <div className={styles.articlesSection} data-testid="articles-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div>
              <h2 style={{ margin: 0 }}>{getDisplayTitle()}</h2>
              {getResultsCount()}
            </div>
            <div className={styles.filterButton}>
              <span>
                Show:
              </span>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                variant="borderless"
                data-testid="category-filter"
                style={{ 
                  fontWeight: 600, 
                  color: '#222', 
                  minWidth: 140,
                  border: 'none'
                }}
                dropdownStyle={{ minWidth: 180 }}
              >
                {categories.map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>
            </div>
          </div>
          <div className={styles.filterButton}>
            <span>
              Sort by:
            </span>
            <Select
              value={sortOrder}
              onChange={handleSortChange}
              data-testid="sort-dropdown"
              variant="borderless"
              style={{ 
                fontWeight: 600, 
                color: '#222', 
                minWidth: 100,
                border: 'none'
              }}
              dropdownStyle={{ minWidth: 140 }}
            >
              {sortOptions.map(opt => (
                <Option key={opt} value={opt}>{opt}</Option>
              ))}
            </Select>
          </div>
        </div>
        
        {loading || reduxIsSearching ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" data-testid="loading-indicator" />
            <div style={{ marginTop: 16 }}>Loading articles...</div>
          </div>
        ) : articlesToDisplay.length === 0 ? (
          searchTerm.trim() ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <h3>No articles found for "{searchTerm}"</h3>
              <p style={{ color: '#666' }}>Try adjusting your search terms or browse all articles.</p>
            </div>
          ) : (
            <NoArticles />
          )
        ) : (
          <>
            <div className={styles.articlesGrid}>
              {articlesToDisplay.map((article: Article) => (
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
            
            {/* Loading more indicator for infinite scroll */}
            {!isSearchMode && loadingMore && (
              <div 
                data-testid="loading-more"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '24px 0',
                  gap: 12
                }}
              >
                <Spin />
                <span>Loading more articles...</span>
              </div>
            )}
            
            {/* End of articles indicator */}
            {!isSearchMode && !hasMore && articles.length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '24px 0',
                color: '#666',
                borderTop: '1px solid #f0f0f0',
                marginTop: '24px'
              }}>
                You've reached the end of the articles!
              </div>
            )}
          </>
        )}
        
        {/* Pagination - Only for search results */}
        {showPagination && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Pagination
              current={currentPage}
              total={searchPaginationInfo.totalCount}
              pageSize={6}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={searchPaginationInfo.totalCount > 50}
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} search results`
              }
              size="default"
              style={{ userSelect: 'none' }}
              data-testid="pagination"
            />
          </div>
        )}
      </div>

      {/* Widget Section */}
      <div className={styles.widgetSection}>
        <div className={styles.rightSidebar}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="primary" 
              onClick={() => navigate('/dashboard/add-article')}
              style={{ marginTop: 4, height: 40, width: '50%' }}
            >
              + Add Article
            </Button>
          </div>
          {import.meta.env.DEV && (
            <Button type="default" block onClick={handleAddSampleArticles}>
              Add Sample Articles
            </Button>
          )}
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;