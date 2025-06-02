import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';
import { Article } from '../../types/article';
import { getArticles, searchArticles, deleteArticle as deleteArticleService } from '../../services/articleService';

interface ArticlesState {
  articles: Article[];
  filteredArticles: Article[];
  loading: boolean;
  error: string | null;
  
  // Filters and search
  selectedCategory: string;
  sortOrder: 'Ascending' | 'Descending';
  searchTerm: string;
  isSearching: boolean;
  
  // Pagination
  currentPage: number;
  articlesPerPage: number;
  totalArticles: number;
}

const initialState: ArticlesState = {
  articles: [],
  filteredArticles: [],
  loading: false,
  error: null,
  
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
  createdAt: article.createdAt instanceof Timestamp ? article.createdAt.toDate().toISOString() : article.createdAt
});

// Async thunks
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async ({ category, sortOrder }: { category?: string; sortOrder?: 'Ascending' | 'Descending' }) => {
    const articles = await getArticles(category, sortOrder);
    // Convert Firebase Timestamps to serializable format
    return articles.map(serializeArticle);
  }
);

export const searchArticlesThunk = createAsyncThunk(
  'articles/searchArticles',
  async ({ searchTerm, category, sortOrder }: { 
    searchTerm: string; 
    category?: string; 
    sortOrder?: 'Ascending' | 'Descending' 
  }) => {
    const articles = await searchArticles(searchTerm, category, sortOrder);
    // Convert Firebase Timestamps to serializable format
    const serializedArticles = articles.map(serializeArticle);
    return { articles: serializedArticles, searchTerm };
  }
);

export const deleteArticleThunk = createAsyncThunk(
  'articles/deleteArticle',
  async (articleId: string) => {
    await deleteArticleService(articleId);
    return articleId;
  }
);

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    setSortOrder: (state, action: PayloadAction<'Ascending' | 'Descending'>) => {
      state.sortOrder = action.payload;
    },
    
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    clearSearch: (state) => {
      state.searchTerm = '';
      state.filteredArticles = state.articles;
      state.totalArticles = state.articles.length;
      state.currentPage = 1;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload as Article[];
        state.filteredArticles = action.payload as Article[];
        state.totalArticles = action.payload.length;
        // Reset to first page when new data is loaded
        state.currentPage = 1;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch articles';
      })
      
      // Search articles
      .addCase(searchArticlesThunk.pending, (state) => {
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
        
        // Adjust current page if necessary after deletion
        const maxPage = Math.ceil(state.totalArticles / state.articlesPerPage);
        if (state.currentPage > maxPage && maxPage > 0) {
          state.currentPage = maxPage;
        } else if (state.totalArticles === 0) {
          state.currentPage = 1;
        }
      });
  },
});

export const { 
  setCategory, 
  setSortOrder, 
  setSearchTerm, 
  clearSearch, 
  setPage, 
  clearError 
} = articlesSlice.actions;

export default articlesSlice.reducer; 