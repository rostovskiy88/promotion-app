import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider, App as AntApp } from 'antd';
import { store, persistor } from './store';
import { router } from './router';
import AuthStateListener from './components/AuthStateListener/AuthStateListener';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { theme } from './theme';
import { SearchProvider } from './contexts/SearchContext';
import AppInitializer from './components/AppInitializer/AppInitializer';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConfigProvider theme={theme}>
            <AntApp>
              <AppInitializer>
                <SearchProvider>
                  <AuthStateListener />
                  <RouterProvider router={router} />
                </SearchProvider>
              </AppInitializer>
            </AntApp>
          </ConfigProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
