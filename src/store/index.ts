import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistCombineReducers, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import articlesReducer from './slices/articlesSlice';
import authReducer from './slices/authSlice';
import cacheReducer from './slices/cacheSlice';
import uiReducer from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui', 'cache'],
  blacklist: ['articles'],
};

const appReducer = persistCombineReducers(persistConfig, {
  auth: authReducer,
  articles: articlesReducer,
  ui: uiReducer,
  cache: cacheReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) => {
  if (action.type === 'RESET_STORE') {
    storage.removeItem('persist:root');
    state = undefined;
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'ui/openModal',
        ],
        ignoredPaths: [
          'auth.user.metadata',
          'auth.firestoreUser.createdAt',
          'auth.firestoreUser.updatedAt',
          'ui.modals',
          'cache.apiCache',
          'articles.articles',
          'articles.filteredArticles',
        ],
        ignoredActionPaths: [
          'payload.articles',
          'payload.0.createdAt',
          'payload.createdAt',
          'payload.firestoreUser.createdAt',
          'payload.firestoreUser.updatedAt',
          'meta.arg.articles',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
