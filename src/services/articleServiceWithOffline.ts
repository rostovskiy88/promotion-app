import { message } from 'antd';
import { store } from '../store';
import { addToOfflineQueue } from '../store/slices/cacheSlice';
import { Article } from '../types/article';
import {
  addArticle as addArticleFirebase,
  deleteArticle as deleteArticleFirebase,
  getAllArticles,
  getArticleById,
  getArticles,
  searchArticles,
  updateArticle as updateArticleFirebase,
} from './articleService';

export class OfflineArticleService {
  private static isOnline(): boolean {
    const state = store.getState();
    return state.cache.isOnline;
  }

  static async addArticle(article: Omit<Article, 'createdAt'>) {
    if (!this.isOnline()) {
      store.dispatch(
        addToOfflineQueue({
          action: 'CREATE_ARTICLE',
          data: article,
        })
      );

      message.info('Article queued for sync when online');

      return {
        id: `offline_${Date.now()}`,
        queued: true,
      };
    }

    try {
      return await addArticleFirebase(article);
    } catch (error) {
      // If network error, queue for offline
      store.dispatch(
        addToOfflineQueue({
          action: 'CREATE_ARTICLE',
          data: article,
        })
      );

      message.warning('Network error - article queued for sync');
      throw error;
    }
  }

  static async updateArticle(id: string, updates: Partial<Article>) {
    if (!this.isOnline()) {
      // Queue for offline sync
      store.dispatch(
        addToOfflineQueue({
          action: 'UPDATE_ARTICLE',
          data: { id, updates },
        })
      );

      message.info('Article update queued for sync when online');
      return;
    }

    try {
      return await updateArticleFirebase(id, updates);
    } catch (error) {
      // If network error, queue for offline
      store.dispatch(
        addToOfflineQueue({
          action: 'UPDATE_ARTICLE',
          data: { id, updates },
        })
      );

      message.warning('Network error - update queued for sync');
      throw error;
    }
  }

  static async deleteArticle(id: string) {
    if (!this.isOnline()) {
      // Queue for offline sync
      store.dispatch(
        addToOfflineQueue({
          action: 'DELETE_ARTICLE',
          data: { id },
        })
      );

      message.info('Article deletion queued for sync when online');
      return;
    }

    try {
      return await deleteArticleFirebase(id);
    } catch (error) {
      // If network error, queue for offline
      store.dispatch(
        addToOfflineQueue({
          action: 'DELETE_ARTICLE',
          data: { id },
        })
      );

      message.warning('Network error - deletion queued for sync');
      throw error;
    }
  }

  // Read operations with offline fallback
  static async getArticles(
    category?: string,
    sortOrder: 'Ascending' | 'Descending' = 'Descending',
    pageSize: number = 6,
    lastDocId?: string
  ) {
    if (!this.isOnline()) {
      // Try to get from offline storage
      const offlineData = localStorage.getItem('articles_cache');
      if (offlineData) {
        try {
          const cached = JSON.parse(offlineData);
          message.info('Showing cached articles (offline mode)');
          return cached;
        } catch (error) {
          console.error('Error parsing offline articles:', error);
        }
      }

      throw new Error('No cached articles available offline');
    }

    try {
      const result = await getArticles(category, sortOrder, pageSize, lastDocId);

      // Cache the result for offline use
      localStorage.setItem('articles_cache', JSON.stringify(result));
      localStorage.setItem('articles_cache_timestamp', Date.now().toString());

      return result;
    } catch (error) {
      // Fallback to cache if network fails
      const offlineData = localStorage.getItem('articles_cache');
      if (offlineData) {
        try {
          const cached = JSON.parse(offlineData);
          message.warning('Network error - showing cached articles');
          return cached;
        } catch (parseError) {
          console.error('Error parsing cached articles:', parseError);
        }
      }

      throw error;
    }
  }

  static async getAllArticles(category?: string, sortOrder: 'Ascending' | 'Descending' = 'Descending') {
    if (!this.isOnline()) {
      const offlineData = localStorage.getItem('all_articles_cache');
      if (offlineData) {
        try {
          const cached = JSON.parse(offlineData);
          message.info('Showing cached articles (offline mode)');
          return cached;
        } catch (error) {
          console.error('Error parsing offline articles:', error);
        }
      }

      throw new Error('No cached articles available offline');
    }

    try {
      const result = await getAllArticles(category, sortOrder);

      // Cache the result
      localStorage.setItem('all_articles_cache', JSON.stringify(result));
      localStorage.setItem('all_articles_cache_timestamp', Date.now().toString());

      return result;
    } catch (error) {
      // Fallback to cache
      const offlineData = localStorage.getItem('all_articles_cache');
      if (offlineData) {
        try {
          const cached = JSON.parse(offlineData);
          message.warning('Network error - showing cached articles');
          return cached;
        } catch (parseError) {
          console.error('Error parsing cached articles:', parseError);
        }
      }

      throw error;
    }
  }

  static async searchArticles(
    searchTerm: string,
    category?: string,
    sortOrder: 'Ascending' | 'Descending' = 'Descending'
  ) {
    if (!this.isOnline()) {
      const offlineData = localStorage.getItem('all_articles_cache');
      if (offlineData) {
        try {
          const cached = JSON.parse(offlineData);
          // Perform local search
          const searchTermLower = searchTerm.toLowerCase();
          const filtered = cached.filter((article: Article) => {
            const titleMatch = article.title?.toLowerCase().includes(searchTermLower);
            const authorMatch = article.authorName?.toLowerCase().includes(searchTermLower);
            const contentMatch = article.content?.toLowerCase().includes(searchTermLower);
            return titleMatch || authorMatch || contentMatch;
          });

          message.info('Searching cached articles (offline mode)');
          return filtered;
        } catch (error) {
          console.error('Error searching offline articles:', error);
        }
      }

      throw new Error('No cached articles available for search');
    }

    try {
      return await searchArticles(searchTerm, category, sortOrder);
    } catch (error) {
      // Fallback to cached search
      const offlineData = localStorage.getItem('all_articles_cache');
      if (offlineData) {
        try {
          const cached = JSON.parse(offlineData);
          const searchTermLower = searchTerm.toLowerCase();
          const filtered = cached.filter((article: Article) => {
            const titleMatch = article.title?.toLowerCase().includes(searchTermLower);
            const authorMatch = article.authorName?.toLowerCase().includes(searchTermLower);
            const contentMatch = article.content?.toLowerCase().includes(searchTermLower);
            return titleMatch || authorMatch || contentMatch;
          });

          message.warning('Network error - searching cached articles');
          return filtered;
        } catch (parseError) {
          console.error('Error searching cached articles:', parseError);
        }
      }

      throw error;
    }
  }

  static async getArticleById(id: string): Promise<Article | null> {
    if (!this.isOnline()) {
      // Check if article is in cache
      const cacheKeys = ['articles_cache', 'all_articles_cache'];

      for (const cacheKey of cacheKeys) {
        const offlineData = localStorage.getItem(cacheKey);
        if (offlineData) {
          try {
            const cached = JSON.parse(offlineData);
            const articles = Array.isArray(cached) ? cached : cached.articles || [];
            const article = articles.find((a: Article) => a.id === id);

            if (article) {
              message.info('Showing cached article (offline mode)');
              return article;
            }
          } catch (error) {
            console.error('Error parsing cached articles:', error);
          }
        }
      }

      throw new Error('Article not available offline');
    }

    try {
      return await getArticleById(id);
    } catch (error) {
      // Fallback to cache
      const cacheKeys = ['articles_cache', 'all_articles_cache'];

      for (const cacheKey of cacheKeys) {
        const offlineData = localStorage.getItem(cacheKey);
        if (offlineData) {
          try {
            const cached = JSON.parse(offlineData);
            const articles = Array.isArray(cached) ? cached : cached.articles || [];
            const article = articles.find((a: Article) => a.id === id);

            if (article) {
              message.warning('Network error - showing cached article');
              return article;
            }
          } catch (parseError) {
            console.error('Error parsing cached articles:', parseError);
          }
        }
      }

      throw error;
    }
  }

  // Clear offline cache
  static clearOfflineCache() {
    localStorage.removeItem('articles_cache');
    localStorage.removeItem('all_articles_cache');
    localStorage.removeItem('articles_cache_timestamp');
    localStorage.removeItem('all_articles_cache_timestamp');
    message.success('Offline cache cleared');
  }

  // Check if cached data is stale (older than 1 hour)
  static isCacheStale(cacheKey: string): boolean {
    const timestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    if (!timestamp) return true;

    const cacheAge = Date.now() - parseInt(timestamp);
    const oneHour = 60 * 60 * 1000;
    return cacheAge > oneHour;
  }
}

// Export as default for easy migration
export default OfflineArticleService;
