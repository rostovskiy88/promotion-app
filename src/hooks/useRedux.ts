// Custom hooks for easier Redux usage across the app

import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchArticles, 
  searchArticlesThunk, 
  deleteArticleThunk,
  setCategory, 
  setSortOrder, 
  setSearchTerm, 
  clearSearch, 
  setPage, 
  clearError as clearArticleError 
} from '../store/slices/articlesSlice';
import {
  setTheme,
  toggleTheme,
  setGlobalLoading,
  openModal,
  closeModal,
  setBreadcrumbs,
  updatePreferences,
  setSidebarCollapsed
} from '../store/slices/uiSlice';
import {
  setCacheEntry,
  addToOfflineQueue,
  setOnlineStatus,
  setSyncing
} from '../store/slices/cacheSlice';

// Articles hooks
export const useArticles = () => {
  const dispatch = useAppDispatch();
  const articlesState = useAppSelector(state => state.articles);
  
  // Computed selectors for pagination
  const articlesToShow = articlesState.searchTerm.trim() 
    ? articlesState.filteredArticles 
    : articlesState.articles;
    
  const totalCount = articlesToShow.length;
  const startIndex = (articlesState.currentPage - 1) * articlesState.articlesPerPage;
  const endIndex = startIndex + articlesState.articlesPerPage;
  const currentPageArticles = articlesToShow.slice(startIndex, endIndex);
  
  const paginationInfo = {
    startItem: (articlesState.currentPage - 1) * articlesState.articlesPerPage + 1,
    endItem: Math.min(articlesState.currentPage * articlesState.articlesPerPage, totalCount),
    totalCount,
    hasMultiplePages: totalCount > articlesState.articlesPerPage,
  };

  return {
    // State
    ...articlesState,
    
    // Computed pagination data
    articlesToShow,
    currentPageArticles,
    paginationInfo,
    
    // Actions
    fetchArticles: (category?: string, sortOrder?: 'Ascending' | 'Descending') => 
      dispatch(fetchArticles({ category, sortOrder })),
    
    searchArticles: (searchTerm: string, category?: string, sortOrder?: 'Ascending' | 'Descending') =>
      dispatch(searchArticlesThunk({ searchTerm, category, sortOrder })),
    
    deleteArticle: (id: string) => dispatch(deleteArticleThunk(id)),
    
    setCategory: (category: string) => dispatch(setCategory(category)),
    setSortOrder: (order: 'Ascending' | 'Descending') => dispatch(setSortOrder(order)),
    setSearchTerm: (term: string) => dispatch(setSearchTerm(term)),
    clearSearch: () => dispatch(clearSearch()),
    setPage: (page: number) => dispatch(setPage(page)),
    clearError: () => dispatch(clearArticleError()),
  };
};

// UI hooks
export const useUI = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui);

  return {
    // State
    ...uiState,
    
    // Actions
    setTheme: (theme: 'light' | 'dark') => dispatch(setTheme(theme)),
    toggleTheme: () => dispatch(toggleTheme()),
    setGlobalLoading: (loading: boolean) => dispatch(setGlobalLoading(loading)),
    
    openModal: (id: string, title?: string, content?: any) =>
      dispatch(openModal({ id, isOpen: true, title, content })),
    
    closeModal: (id: string) => dispatch(closeModal(id)),
    
    setBreadcrumbs: (breadcrumbs: Array<{ title: string; path?: string }>) =>
      dispatch(setBreadcrumbs(breadcrumbs)),
    
    updatePreferences: (preferences: any) => dispatch(updatePreferences(preferences)),
    
    setSidebarCollapsed: (collapsed: boolean) => dispatch(setSidebarCollapsed(collapsed)),
  };
};

// Cache hooks
export const useCache = () => {
  const dispatch = useAppDispatch();
  const cacheState = useAppSelector(state => state.cache);

  return {
    // State
    ...cacheState,
    
    // Actions
    cacheData: (key: string, data: any, expiresIn?: number) =>
      dispatch(setCacheEntry({ key, data, expiresIn })),
    
    addToQueue: (action: string, data: any) =>
      dispatch(addToOfflineQueue({ action, data })),
    
    setOnline: (isOnline: boolean) => dispatch(setOnlineStatus(isOnline)),
    setSyncing: (syncing: boolean) => dispatch(setSyncing(syncing)),
  };
};

// Auth hooks (enhanced)
export const useAuth = () => {
  const authState = useAppSelector(state => state.auth);

  return {
    // State
    ...authState,
    
    // Computed values
    isAuthenticated: !!authState.user,
    userDisplayName: authState.user?.displayName || authState.user?.email || 'User',
    hasVerifiedEmail: authState.user?.emailVerified || false,
  };
};

// Combined hook for common app state
export const useAppState = () => {
  const articles = useArticles();
  const ui = useUI();
  const cache = useCache();
  const auth = useAuth();

  return {
    articles,
    ui,
    cache,
    auth,
    
    // Global computed state
    isLoading: articles.loading || ui.globalLoading || cache.isSyncing,
    hasErrors: !!articles.error || cache.syncErrors.length > 0,
    isOffline: !cache.isOnline,
  };
}; 