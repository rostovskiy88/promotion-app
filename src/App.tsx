import { App as AntApp, ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import AppInitializer from './components/AppInitializer/AppInitializer';
import AuthStateListener from './components/AuthStateListener/AuthStateListener';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { router } from './router';
import { persistor, store } from './store';
import { theme } from './theme';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConfigProvider theme={theme}>
            <AntApp>
              <AppInitializer>
                <AuthStateListener />
                <RouterProvider router={router} />
              </AppInitializer>
            </AntApp>
          </ConfigProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
