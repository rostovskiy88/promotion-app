import React, { useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useCache } from '../../hooks/useRedux';
import OfflineIndicator from '../OfflineIndicator/OfflineIndicator';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resetSession } = useCache();
  
  // Reset session state on app initialization (only once)
  useEffect(() => {
    resetSession();
  }, []); // Remove resetSession from dependency array to prevent infinite loop
  
  // Initialize network status monitoring
  useNetworkStatus();

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
};

export default AppInitializer; 