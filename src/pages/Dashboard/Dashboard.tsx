import { UpOutlined } from '@ant-design/icons';
import { Button, Pagination, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import NoArticles from '../../components/NoArticles/NoArticles';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useArticles, useUI } from '../../hooks/useRedux';
import { getAllAuthors } from '../../services/userService';
import { Article } from '../../types/article';
import { addSampleArticles } from '../../utils/addSampleArticles';
import { formatArticleDate } from '../../utils/formatArticleDate';
import styles from './Dashboard.module.css';

const { Option } = Select;

const categories = ['All Categories', 'Productivity', 'Media', 'Business'];
const sortOptions = ['Ascending', 'Descending'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAtTop, setIsAtTop] = useState(true);
  const [authorsMap, setAuthorsMap] = useState<Record<string, any>>({});

  const {
    articles,
    loading,
    loadingMore,
    hasMore,
    error,
    selectedCategory,
    sortOrder,
    searchTerm,
    isSearching: reduxIsSearching,

    currentPage,
    currentPageSearchArticles,
    searchPaginationInfo,

    fetchArticles,
    loadMoreArticles,
    searchArticles,
    deleteArticle,
    setCategory,
    setSortOrder,
    setPage,
    clearError,
  } = useArticles();

  const { setGlobalLoading } = useUI();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsAtTop(scrollTop < 100); // Hide button when within 100px of top
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchArticles(selectedCategory, sortOrder, true);
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchArticles(searchTerm, selectedCategory, sortOrder);
    } else {
      fetchArticles(selectedCategory, sortOrder, true);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchArticles(searchTerm, selectedCategory, sortOrder);
    } else {
      fetchArticles(selectedCategory, sortOrder, true);
    }
  }, [selectedCategory, sortOrder]);

  useInfiniteScroll({
    hasMore: hasMore && !searchTerm.trim(),
    loading: loadingMore,
    onLoadMore: () => {
      if (!searchTerm.trim()) {
        loadMoreArticles(selectedCategory, sortOrder);
      }
    },
    threshold: 300,
  });

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleCategoryChange = (category: string) => {
    setCategory(category);
  };

  const handleSortChange = (sort: 'Ascending' | 'Descending') => {
    setSortOrder(sort);
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
      behavior: 'smooth',
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
        <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }} data-testid='results-count'>
          {totalCount} article{totalCount !== 1 ? 's' : ''} found
          {totalCount > 0 && ` • Showing ${startItem}-${endItem}`}
        </span>
      );
    }

    const totalLoaded = articles.length;
    if (totalLoaded > 0) {
      return (
        <span style={{ color: '#666', fontSize: '14px', fontWeight: 400 }} data-testid='results-count'>
          {totalLoaded} article{totalLoaded !== 1 ? 's' : ''} loaded
          {hasMore && ' • Scroll for more'}
        </span>
      );
    }

    return null;
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    document.querySelector(`.${styles.articlesSection}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const articlesToDisplay = searchTerm.trim() ? currentPageSearchArticles : articles;
  useEffect(() => {
  }, [articlesToDisplay]);
  const isSearchMode = searchTerm.trim();
  const showPagination = isSearchMode && searchPaginationInfo.hasMultiplePages;
  const showScrollToTop = !isSearchMode && articles.length > 6 && !isAtTop; 

  useEffect(() => {
    (async () => {
      const authors = await getAllAuthors();
      const map: Record<string, any> = {};
      authors.forEach(author => {
        if (author.uid) map[author.uid] = author;
      });
      setAuthorsMap(map);
    })();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      {showScrollToTop && (
        <Button
          type='primary'
          shape='circle'
          size='large'
          icon={<UpOutlined />}
          onClick={scrollToTop}
          data-testid='scroll-to-top'
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '56px',
            width: '56px',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            border: 'none',
            zIndex: 1000,
          }}
          title='Scroll to top'
        />
      )}

      <div className={styles.articlesSection} data-testid='articles-section'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div>
              <h2 style={{ margin: 0 }}>{getDisplayTitle()}</h2>
              {getResultsCount()}
            </div>
            <div className={styles.filterButton}>
              <span>Show:</span>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                variant='borderless'
                data-testid='category-filter'
                style={{
                  fontWeight: 600,
                  color: '#222',
                  minWidth: 140,
                  border: 'none',
                }}
                dropdownStyle={{ minWidth: 180 }}
              >
                {categories.map(cat => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className={styles.filterButton}>
            <span>Sort by:</span>
            <Select
              value={sortOrder}
              onChange={handleSortChange}
              data-testid='sort-dropdown'
              variant='borderless'
              style={{
                fontWeight: 600,
                color: '#222',
                minWidth: 100,
                border: 'none',
              }}
              dropdownStyle={{ minWidth: 140 }}
            >
              {sortOptions.map(opt => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {loading || reduxIsSearching ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size='large' data-testid='loading-indicator' />
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
              {articlesToDisplay.map((article: Article) => {
                const author = article.authorId && authorsMap[article.authorId];
                return (
                  <ArticleCard
                    key={article.id}
                    category={article.category ?? ''}
                    date={formatArticleDate(
                      typeof article.createdAt === 'string' ? new Date(article.createdAt) : article.createdAt.toDate()
                    )}
                    title={article.title}
                    description={article.content ?? ''}
                    authorName={
                      author
                        ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email
                        : article.authorName || 'Anonymous'
                    }
                    authorAvatar={author ? author.avatarUrl : article.authorAvatar || '/default-avatar.png'}
                    authorId={article.authorId}
                    readMoreUrl={`/dashboard/article/${article.id}`}
                    imageUrl={
                      typeof article.imageUrl === 'string' ? article.imageUrl : 'https://via.placeholder.com/400x200'
                    }
                    onEdit={() => article.id && handleEdit(article.id)}
                    onDelete={() => article.id && handleDelete(article.id)}
                  />
                );
              })}
            </div>

            {!isSearchMode && loadingMore && (
              <div
                data-testid='loading-more'
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '24px 0',
                  gap: 12,
                }}
              >
                <Spin />
                <span>Loading more articles...</span>
              </div>
            )}

            {!isSearchMode && !hasMore && articles.length > 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: '#666',
                  borderTop: '1px solid #f0f0f0',
                  marginTop: '24px',
                }}
              >
                You've reached the end of the articles!
              </div>
            )}
          </>
        )}

        {showPagination && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <Pagination
              current={currentPage}
              total={searchPaginationInfo.totalCount}
              pageSize={6}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={searchPaginationInfo.totalCount > 50}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} search results`}
              size='default'
              style={{ userSelect: 'none' }}
              data-testid='pagination'
            />
          </div>
        )}
      </div>

      <div className={styles.widgetSection}>
        <div className={styles.rightSidebar}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type='primary'
              onClick={() => navigate('/dashboard/add-article')}
              style={{ marginTop: 4, height: 40, width: '50%' }}
            >
              + Add Article
            </Button>
          </div>
          {import.meta.env.DEV && (
            <Button type='default' block onClick={handleAddSampleArticles} style={{ marginTop: 12 }}>
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
