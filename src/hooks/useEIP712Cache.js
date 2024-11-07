import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'eip712UserKeys';
const ADDRESS_DATA_KEY = 'eip712AddressData';

// Utility function to safely parse JSON with error handling
const safeJSONParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

const useEIP712Storage = (timeoutMinutes = 30, options = {}) => {
  const {
    secureModeEnabled = true,
    maxRetries = 3
  } = options;

  // Use a ref to track component mounting state
  const isMounted = useRef(true);

  // Initialize state with keys data from localStorage
  const [userKeyMap, setUserKeyMap] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = safeJSONParse(stored, {});
    const now = Date.now();

    // Filter out expired entries during initialization
    const filtered = Object.entries(parsed).reduce((acc, [address, data]) => {
      const expirationTime = data.timestamp + (timeoutMinutes * 60 * 1000);
      if (now <= expirationTime) {
        acc[address] = data;
      }
      return acc;
    }, {});

    return filtered;
  });

  // Initialize state with additional address data from localStorage
  const [addressDataMap, setAddressDataMap] = useState(() => {
    const stored = localStorage.getItem(ADDRESS_DATA_KEY);
    return safeJSONParse(stored, {});
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (secureModeEnabled) {
        clearAllKeys();
      }
    };
  }, []);

  // Set up expiration timer for all entries
  useEffect(() => {
    const timers = Object.entries(userKeyMap).map(([address, data]) => {
      const timeLeft = (data.timestamp + (timeoutMinutes * 60 * 1000)) - Date.now();
      if (timeLeft <= 0) return null;

      return setTimeout(() => {
        if (isMounted.current) {
          removeUserKeys(address);
        }
      }, timeLeft);
    });

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [userKeyMap, timeoutMinutes]);

  // Persist to localStorage whenever the maps change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userKeyMap));
    } catch (error) {
      console.error('Error writing keys to localStorage:', error);
    }
  }, [userKeyMap]);

  useEffect(() => {
    try {
      localStorage.setItem(ADDRESS_DATA_KEY, JSON.stringify(addressDataMap));
    } catch (error) {
      console.error('Error writing address data to localStorage:', error);
    }
  }, [addressDataMap]);

  const getUserKeys = useCallback((userAddress) => {
    if (!userAddress || !userKeyMap[userAddress]) {
      return null;
    }

    const userData = userKeyMap[userAddress];
    const now = Date.now();
    const expirationTime = userData.timestamp + (timeoutMinutes * 60 * 1000);

    if (now > expirationTime) {
      removeUserKeys(userAddress);
      return null;
    }

    // Return a new object to prevent external modifications
    return {
      publicKey: userData.publicKey,
      privateKey: secureModeEnabled ? null : userData.privateKey,
      signature: userData.signature
    };
  }, [userKeyMap, timeoutMinutes, secureModeEnabled]);

  const storeUserKeys = useCallback((userAddress, { publicKey, privateKey, signature }, additionalData = {}) => {
    if (!userAddress || !publicKey) {
      throw new Error('User address and public key are required');
    }

    // Check retry count
    const currentData = userKeyMap[userAddress];
    if (currentData && currentData.retryCount >= maxRetries) {
      console.error('Maximum retry attempts exceeded for address:', userAddress);
      return false;
    }

    // Basic validation
    if (!/^0x[0-9a-fA-F]{40}$/i.test(userAddress)) {
      console.error('Invalid Ethereum address format');
      return false;
    }

    if (signature && !/^0x[0-9a-fA-F]{130}$/.test(signature)) {
      console.error('Invalid signature format');
      return false;
    }

    // Store keys
    setUserKeyMap(prev => ({
      ...prev,
      [userAddress]: {
        publicKey,
        privateKey: secureModeEnabled ? null : privateKey,
        signature,
        timestamp: Date.now(),
        retryCount: (currentData?.retryCount || 0) + 1
      }
    }));

    // Store additional data if provided
    if (Object.keys(additionalData).length > 0) {
      setAddressDataMap(prev => ({
        ...(prev || {}),
        [userAddress]: {
          ...(prev?.[userAddress] || {}),
          ...additionalData,
          lastUpdated: Date.now()
        }
      }));
    }

    return true;
  }, [userKeyMap, maxRetries, secureModeEnabled]);

  const getAddressData = useCallback((userAddress) => {
    if (!userAddress) return null;
    
    const keys = getUserKeys(userAddress);
    const additionalData = addressDataMap?.[userAddress] || {};

    if (!keys && Object.keys(additionalData).length === 0) {
      return null;
    }

    return {
      ...additionalData,
      hasKeys: Boolean(keys),
      keys
    };
  }, [getUserKeys, addressDataMap]);

  const updateAddressData = useCallback((userAddress, newData) => {
    if (!userAddress) {
      throw new Error('User address is required');
    }

    setAddressDataMap(prev => ({
      ...(prev || {}),
      [userAddress]: {
        ...(prev?.[userAddress] || {}),
        ...newData,
        lastUpdated: Date.now()
      }
    }));
  }, []);

  const removeUserKeys = useCallback((userAddress) => {
    if (!userAddress) return;

    setUserKeyMap(prev => {
      if (!prev) return {};
      const newMap = { ...prev };
      delete newMap[userAddress];
      return newMap;
    });

    setAddressDataMap(prev => {
      if (!prev) return {};
      const newMap = { ...prev };
      delete newMap[userAddress];
      return newMap;
    });
  }, []);

  const clearAllKeys = useCallback(() => {
    setUserKeyMap({});
    setAddressDataMap({});
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ADDRESS_DATA_KEY);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, []);

  const getStoredAddresses = useCallback(() => {
    const keyAddresses = new Set(Object.keys(userKeyMap || {}));
    const dataAddresses = new Set(Object.keys(addressDataMap || {}));
    return Array.from(new Set([...keyAddresses, ...dataAddresses]));
  }, [userKeyMap, addressDataMap]);

  const hasStoredData = useCallback((userAddress) => {
    return Boolean(userKeyMap?.[userAddress] || addressDataMap?.[userAddress]);
  }, [userKeyMap, addressDataMap]);

  return {
    getUserKeys,
    storeUserKeys,
    getAddressData,
    updateAddressData,
    removeUserKeys,
    clearAllKeys,
    getStoredAddresses,
    hasStoredData,
  };
};

export default useEIP712Storage;