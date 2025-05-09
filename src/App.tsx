import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { router } from './router';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </PersistGate>
    </Provider>
  );
}

export default App;
