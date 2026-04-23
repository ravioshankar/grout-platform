import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useIsOffline(): boolean {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const apply = (connected: boolean | null) => {
      setOffline(connected === false);
    };

    const unsub = NetInfo.addEventListener((state) => {
      apply(state.isConnected);
    });

    NetInfo.fetch().then((state) => apply(state.isConnected));

    return () => unsub();
  }, []);

  return offline;
}
