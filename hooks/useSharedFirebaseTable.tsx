import { useState, useEffect } from 'react';
import database from '@react-native-firebase/database';
import { FirebaseDatabaseTypes } from '@react-native-firebase/database';

// Types
type Callback = (data: any) => void;
type UnsubscribeFunction = () => void;

interface ListenerInfo {
  reference: FirebaseDatabaseTypes.Reference;
  listener: (a: FirebaseDatabaseTypes.DataSnapshot | null, b?: string | null) => void; // Fixed type
}

interface ListenerManager {
  listeners: Record<string, ListenerInfo>;
  subscribers: Record<string, Record<string, Callback>>;
  subscribe: (tableName: string, callback: Callback) => UnsubscribeFunction;
}

// Global listener manager
const listenerManager: ListenerManager = {
  listeners: {},
  subscribers: {},
  
  subscribe(tableName: string, callback: Callback): UnsubscribeFunction {
    const subscriberId = Math.random().toString(36);
    
    // Initialize subscribers object for this table
    if (!this.subscribers[tableName]) {
      this.subscribers[tableName] = {};
    }
    
    // Add subscriber
    this.subscribers[tableName][subscriberId] = callback;
    
    // Create Firebase listener only if it's the first subscriber
    if (!this.listeners[tableName]) {
      console.log(`🔥 Creating Firebase listener for: ${tableName}`);
      
      const reference = database().ref(`/${tableName}`);
      const listener = reference.on('value', (snapshot) => {
        const data = snapshot.val();
        
        // Notify ALL subscribers of this table
        Object.values(this.subscribers[tableName] || {}).forEach((subscriberCallback) => {
          subscriberCallback(data);
        });
      });
      
      this.listeners[tableName] = { reference, listener };
    } else {
      // Immediately call with current data if listener already exists
      console.log(`♻️ Reusing existing listener for: ${tableName}`);
    }
    
    // Return unsubscribe function
    return () => {
      if (this.subscribers[tableName]) {
        delete this.subscribers[tableName][subscriberId];
        
        // Remove Firebase listener if no more subscribers
        const remainingSubscribers = Object.keys(this.subscribers[tableName]).length;
        if (remainingSubscribers === 0) {
          console.log(`🗑️ Removing Firebase listener for: ${tableName}`);
          
          const { reference, listener } = this.listeners[tableName];
          reference.off('value', listener);
          delete this.listeners[tableName];
          delete this.subscribers[tableName];
        }
      }
    };
  }
};

interface UseSharedFirebaseTableResult {
  data: any;
  isLoading: boolean;
  error: Error | null;
}

export function useSharedFirebaseTable(tableName: string): UseSharedFirebaseTableResult {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = listenerManager.subscribe(tableName, (newData: any) => {
      setData(newData);
      setIsLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [tableName]);

  return { data, isLoading, error };
}