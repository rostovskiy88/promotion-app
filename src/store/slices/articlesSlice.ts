import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';
import { Article } from '../../types/article';
import { getArticles, searchArticles, deleteArticle as deleteArticleService } from '../../services/articleService';

interface ArticlesState {
  articles: Article[];
  filteredArticles: Article[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;

  // Lazy loading
  hasMore: boolean;
  lastDocId: string | null; // Store just the ID instead of the full document

  // Filters and search
  selectedCategory: string;
  sortOrder: 'Ascending' | 'Descending';
  searchTerm: string;
  isSearching: boolean;

  // Legacy pagination (for search results)
  currentPage: number;
  articlesPerPage: number;
  totalArticles: number;
}

const initialState: ArticlesState = {
  articles: [],
  filteredArticles: [],
  loading: false,
  loadingMore: false,
  error: null,

  hasMore: true,
  lastDocId: null,

  selectedCategory: 'All Categories',
  sortOrder: 'Descending',
  searchTerm: '',
  isSearching: false,

  currentPage: 1,
  articlesPerPage: 6,
  totalArticles: 0,
};

// Helper function to serialize Firebase Timestamps
const serializeArticle = (article: any): Article => ({
  ...article,
  createdAt: article.createdAt instanceof Timestamp ? article.createdAt.toDate().toISOString() : article.createdAt,
});

// Async thunks
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (
    {
      category,
      sortOrder,
      reset = true,
    }: {
      category?: string;
      sortOrder?: 'Ascending' | 'Descending';
      reset?: boolean;
    },
    { getState }
  ) => {
    const state = getState() as { articles: ArticlesState };

    // For pagination, we'll pass the lastDocId and let the service handle finding the document
    const lastDocId = reset ? undefined : state.articles.lastDocId || undefined;

    const result = await getArticles(category, sortOrder, 6, lastDocId);

    return {
      articles: result.articles.map(serializeArticle),
      hasMore: result.hasMore,
      lastDocId: result.lastDocId,
      reset,
    };
  }
);

export const loadMoreArticles = createAsyncThunk(
  'articles/loadMoreArticles',
  async (
    {
      category,
      sortOrder,
    }: {
      category?: string;
      sortOrder?: 'Ascending' | 'Descending';
    },
    { getState }
  ) => {
    const state = getState() as { articles: ArticlesState };
    const { lastDocId } = state.articles;

    if (!lastDocId) {
      throw new Error('No more articles to load');
    }

    const result = await getArticles(category, sortOrder, 6, lastDocId);

    return {
      articles: result.articles.map(serializeArticle),
      hasMore: result.hasMore,
      lastDocId: result.lastDocId,
    };
  }
);

export const searchArticlesThunk = createAsyncThunk(
  'articles/searchArticles',
  async ({
    searchTerm,
    category,
    sortOrder,
  }: {
    searchTerm: string;
    category?: string;
    sortOrder?: 'Ascending' | 'Descending';
  }) => {
    const articles = await searchArticles(searchTerm, category, sortOrder);
    // Convert Firebase Timestamps to serializable format
    return { articles: articles.map(serializeArticle), searchTerm };
  }
);

export const deleteArticleThunk = createAsyncThunk('articles/deleteArticle', async (id: string) => {
  await deleteArticleService(id);
  return id;
});

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1; // Reset pagination for search
      // Reset lazy loading state
      state.articles = [];
      state.hasMore = true;
      state.lastDocId = null;
    },

    setSortOrder: (state, action: PayloadAction<'Ascending' | 'Descending'>) => {
      state.sortOrder = action.payload;
      // Reset lazy loading state
      state.articles = [];
      state.hasMore = true;
      state.lastDocId = null;
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset pagination
    },

    clearSearch: state => {
      state.searchTerm = '';
      state.filteredArticles = [];
      state.totalArticles = 0;
      state.currentPage = 1;
      // Reset lazy loading to show main articles
      state.articles = [];
      state.hasMore = true;
      state.lastDocId = null;
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    clearError: state => {
      state.error = null;
    },

    resetArticles: state => {
      state.articles = [];
      state.hasMore = true;
      state.lastDocId = null;
    },
  },

  extraReducers: builder => {
    builder
      // Fetch articles (initial load or reset)
      .addCase(fetchArticles.pending, (state, action) => {
        if (action.meta.arg.reset) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        if (action.payload.reset) {
          state.articles = action.payload.articles as Article[];
        } else {
          state.articles = [...state.articles, ...(action.payload.articles as Article[])];
        }

        state.hasMore = action.payload.hasMore;
        state.lastDocId = action.payload.lastDocId;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to fetch articles';
      })

      // Load more articles
      .addCase(loadMoreArticles.pending, state => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreArticles.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.articles = [...state.articles, ...(action.payload.articles as Article[])];
        state.hasMore = action.payload.hasMore;
        state.lastDocId = action.payload.lastDocId;
      })
      .addCase(loadMoreArticles.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to load more articles';
      })

      // Search articles (still uses pagination for search results)
      .addCase(searchArticlesThunk.pending, state => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchArticlesThunk.fulfilled, (state, action) => {
        state.isSearching = false;
        state.filteredArticles = action.payload.articles as Article[];
        state.searchTerm = action.payload.searchTerm;
        state.totalArticles = action.payload.articles.length;
        // Reset to first page when search results change
        state.currentPage = 1;
      })
      .addCase(searchArticlesThunk.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.error.message || 'Search failed';
      })

      // Delete article
      .addCase(deleteArticleThunk.fulfilled, (state, action) => {
        const articleId = action.payload;
        state.articles = state.articles.filter(article => article.id !== articleId);
        state.filteredArticles = state.filteredArticles.filter(article => article.id !== articleId);
        state.totalArticles = state.filteredArticles.length;

        // Adjust current page if necessary after deletion (for search results)
        const maxPage = Math.ceil(state.totalArticles / state.articlesPerPage);
        if (state.currentPage > maxPage && maxPage > 0) {
          state.currentPage = maxPage;
        } else if (state.totalArticles === 0) {
          state.currentPage = 1;
        }
      });
  },
});

export const { setCategory, setSortOrder, setSearchTerm, clearSearch, setPage, clearError, resetArticles } =
  articlesSlice.actions;

export default articlesSlice.reducer;
