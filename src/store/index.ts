import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import all reducers
import authReducer from './slices/authSlice';
import articlesReducer from './slices/articlesSlice';
import uiReducer from './slices/uiSlice';
import cacheReducer from './slices/cacheSlice';

// Persist config for different slices
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui', 'cache'], // persist auth, ui preferences, and cache
  blacklist: ['articles'], // don't persist articles (real-time data)
};

// Combine all reducers
const rootReducer = persistCombineReducers(persistConfig, {
  auth: authReducer,
  articles: articlesReducer,
  ui: uiReducer,
  cache: cacheReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'ui/openModal', // Modal functions are not serializable
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user.metadata',
          'ui.modals',
          'cache.apiCache',
          'articles.articles', // Ignore articles array to prevent timestamp warnings
          'articles.filteredArticles', // Ignore filtered articles
        ],
        // Ignore actions that might contain Firebase Timestamps
        ignoredActionPaths: [
          'payload.articles',
          'payload.0.createdAt',
          'payload.createdAt',
          'meta.arg.articles',
        ]
      }
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 