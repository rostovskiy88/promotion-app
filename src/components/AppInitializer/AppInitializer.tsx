import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import OfflineIndicator from '../OfflineIndicator/OfflineIndicator';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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