import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  clearError as clearArticleError,
  clearSearch,
  deleteArticleThunk,
  fetchArticles,
  loadMoreArticles,
  resetArticles,
  searchArticlesThunk,
  setCategory,
  setPage,
  setSearchTerm,
  setSortOrder,
} from '../store/slices/articlesSlice';
import { refreshFirestoreUser } from '../store/slices/authSlice';
import {
  addToOfflineQueue,
  resetSessionState,
  setCacheEntry,
  setOnlineStatus,
  setSyncing,
} from '../store/slices/cacheSlice';
import {
  closeModal,
  openModal,
  setBreadcrumbs,
  setGlobalLoading,
  setSidebarCollapsed,
  setTheme,
  toggleTheme,
  updatePreferences,
} from '../store/slices/uiSlice';

const useSafeSelector = (selector: (state: any) => any, fallback: any = {}) => {
  const result = useAppSelector(selector);
  return result !== undefined ? result : fallback;
};

const useSafeDispatch = () => {
  return useAppDispatch();
};

export const useArticles = () => {
  const dispatch = useSafeDispatch();
  const articlesState = useSafeSelector(state => state.articles, {
    articles: [],
    filteredArticles: [],
    loading: false,
    error: null,
    hasMore: false,
    lastDocId: null,
    currentPage: 1,
    articlesPerPage: 6,
    category: 'All Categories',
    sortOrder: 'Descending',
    searchTerm: '',
    isSearching: false,
  });

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
    ...articlesState,

    searchArticlesToShow,
    currentPageSearchArticles,
    searchPaginationInfo,

    fetchArticles: useCallback(
      (category?: string, sortOrder?: 'Ascending' | 'Descending', reset?: boolean) =>
        dispatch(fetchArticles({ category, sortOrder, reset })),
      [dispatch]
    ),

    loadMoreArticles: useCallback(
      (category?: string, sortOrder?: 'Ascending' | 'Descending') =>
        dispatch(loadMoreArticles({ category, sortOrder })),
      [dispatch]
    ),

    searchArticles: useCallback(
      (searchTerm: string, category?: string, sortOrder?: 'Ascending' | 'Descending') =>
        dispatch(searchArticlesThunk({ searchTerm, category, sortOrder })),
      [dispatch]
    ),

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

export const useUI = () => {
  const dispatch = useSafeDispatch();
  const uiState = useSafeSelector(state => state.ui, {
    theme: 'light',
    globalLoading: false,
    modals: {},
    breadcrumbs: [],
    preferences: {},
    sidebarCollapsed: false,
  });

  return {
    ...uiState,

    setTheme: (theme: 'light' | 'dark') => dispatch(setTheme(theme)),
    toggleTheme: () => dispatch(toggleTheme()),
    setGlobalLoading: (loading: boolean) => dispatch(setGlobalLoading(loading)),

    openModal: (id: string, title?: string, content?: any) => dispatch(openModal({ id, isOpen: true, title, content })),

    closeModal: (id: string) => dispatch(closeModal(id)),

    setBreadcrumbs: (breadcrumbs: Array<{ title: string; path?: string }>) => dispatch(setBreadcrumbs(breadcrumbs)),

    updatePreferences: (preferences: any) => dispatch(updatePreferences(preferences)),

    setSidebarCollapsed: (collapsed: boolean) => dispatch(setSidebarCollapsed(collapsed)),
  };
};

export const useCache = () => {
  const dispatch = useSafeDispatch();
  const cacheState = useSafeSelector(state => state.cache, {
    apiCache: {},
    offlineQueue: [],
    isOnline: true,
    lastOnlineTime: Date.now(),
    hasBeenOfflineSession: false,
    isSyncing: false,
    syncErrors: [],
    lastSyncTime: 0,
    metrics: {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
    },
  });

  return {
    ...cacheState,

    cacheData: (key: string, data: any, expiresIn?: number) => dispatch(setCacheEntry({ key, data, expiresIn })),

    addToQueue: (action: string, data: any) => dispatch(addToOfflineQueue({ action, data })),

    setOnline: useCallback((isOnline: boolean) => dispatch(setOnlineStatus(isOnline)), [dispatch]),
    resetSession: useCallback(() => dispatch(resetSessionState()), [dispatch]),
    setSyncing: useCallback((syncing: boolean) => dispatch(setSyncing(syncing)), [dispatch]),
  };
};

export const useAuth = () => {
  const dispatch = useSafeDispatch();
  const authState = useSafeSelector(state => state.auth, {
    user: null,
    firestoreUser: null,
    loading: false,
    error: null,
  });

  return {
    ...authState,

    isAuthenticated: !!authState.user,
    userDisplayName: authState.user?.displayName || authState.user?.email || 'User',
    hasVerifiedEmail: authState.user?.emailVerified || false,

    refreshFirestoreUser: useCallback((uid: string) => dispatch(refreshFirestoreUser(uid)), [dispatch]),
  };
};

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

    isLoading: articles.loading || ui.globalLoading || cache.isSyncing,
    hasErrors: !!articles.error || cache.syncErrors.length > 0,
    isOffline: !cache.isOnline,
  };
};
