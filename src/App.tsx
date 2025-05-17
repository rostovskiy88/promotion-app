import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { router } from './router';
import AuthStateListener from './components/AuthStateListener/AuthStateListener';
import { theme } from './theme';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={theme}>
          <AntApp>
            <AuthStateListener />
            <RouterProvider router={router} />
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
