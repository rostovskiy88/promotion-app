import React, { useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useCache } from '../../hooks/useRedux';
import OfflineIndicator from '../OfflineIndicator/OfflineIndicator';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resetSession } = useCache();

  useEffect(() => {
    resetSession();
  }, []);

  useNetworkStatus();

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
};

export default AppInitializer;
