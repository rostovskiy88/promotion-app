// Custom hooks for easier Redux usage across the app

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchArticles, 
  loadMoreArticles,
  searchArticlesThunk, 
  deleteArticleThunk,
  setCategory, 
  setSortOrder, 
  setSearchTerm, 
  clearSearch, 
  setPage, 
  clearError as clearArticleError,
  resetArticles
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
  
  // For search results, we still use pagination
  const searchArticlesToShow = articlesState.filteredArticles;
  const searchTotalCount = searchArticlesToShow.length;
  const searchStartIndex = (articlesState.currentPage - 1) * articlesState.articlesPerPage;
  const searchEndIndex = searchStartIndex + articlesState.articlesPerPage;
  const currentPageSearchArticles = searchArticlesToShow.slice(searchStartIndex, searchEndIndex);
  
  const searchPaginationInfo = {
    startItem: (articlesState.currentPage - 1) * articlesState.articlesPerPage + 1,
    endItem: Math.min(articlesState.currentPage * articlesState.articlesPerPage, searchTotalCount),
    totalCount: searchTotalCount,
    hasMultiplePages: searchTotalCount > articlesState.articlesPerPage,
  };

  return {
    // State
    ...articlesState,
    
    // For search results (paginated)
    searchArticlesToShow,
    currentPageSearchArticles,
    searchPaginationInfo,
    
    // Actions
    fetchArticles: useCallback((category?: string, sortOrder?: 'Ascending' | 'Descending', reset?: boolean) => 
      dispatch(fetchArticles({ category, sortOrder, reset })), [dispatch]),
    
    loadMoreArticles: useCallback((category?: string, sortOrder?: 'Ascending' | 'Descending') => 
      dispatch(loadMoreArticles({ category, sortOrder })), [dispatch]),
    
    searchArticles: useCallback((searchTerm: string, category?: string, sortOrder?: 'Ascending' | 'Descending') =>
      dispatch(searchArticlesThunk({ searchTerm, category, sortOrder })), [dispatch]),
    
    deleteArticle: useCallback((id: string) => dispatch(deleteArticleThunk(id)), [dispatch]),
    
    setCategory: useCallback((category: string) => dispatch(setCategory(category)), [dispatch]),
    setSortOrder: useCallback((order: 'Ascending' | 'Descending') => dispatch(setSortOrder(order)), [dispatch]),
    setSearchTerm: useCallback((term: string) => dispatch(setSearchTerm(term)), [dispatch]),
    clearSearch: useCallback(() => dispatch(clearSearch()), [dispatch]),
    setPage: useCallback((page: number) => dispatch(setPage(page)), [dispatch]),
    clearError: useCallback(() => dispatch(clearArticleError()), [dispatch]),
    resetArticles: useCallback(() => dispatch(resetArticles()), [dispatch]),
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