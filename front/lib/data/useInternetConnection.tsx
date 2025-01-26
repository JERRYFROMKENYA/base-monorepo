// hooks/useInternetConnection.ts
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useInternetConnection = () => {
  const netInfo = useNetInfo();
  const [isConnected, setIsConnected] = useState(netInfo.isConnected);

  useEffect(() => {
    setIsConnected(netInfo.isConnected);
  }, [netInfo]);

  return isConnected;
};