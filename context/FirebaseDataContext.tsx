import { getDatabase, onValue, ref } from '@react-native-firebase/database';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface TableData {
  data: any;
  isLoading: boolean;
  error: Error | null;
}

interface FirebaseDataContextType {
  tables: Record<string, TableData>;
  subscribeToTable: (tableName: string) => void;
  unsubscribeFromTable: (tableName: string) => void;
}

const FirebaseDataContext = createContext<FirebaseDataContextType | null>(null);

interface FirebaseDataProviderProps {
  children: ReactNode;
}

export function FirebaseDataProvider({ children }: FirebaseDataProviderProps) {
  const [tables, setTables] = useState<Record<string, TableData>>({});
  const [listeners, setListeners] = useState<Record<string, any>>({});
  const [refCounts, setRefCounts] = useState<Record<string, number>>({});

  const subscribeToTable = useCallback((tableName: string) => {
    setRefCounts(prev => ({
      ...prev,
      [tableName]: (prev[tableName] || 0) + 1
    }));

    // Initialize table data if not exists
    setTables(prev => {
      if (!prev[tableName]) {
        return {
          ...prev,
          [tableName]: { data: null, isLoading: true, error: null }
        };
      }
      return prev;
    });

    // Create Firebase listener only if first subscriber
    setListeners(prev => {
      if (!prev[tableName]) {
        console.log(`🔥 Creating Firebase listener for: ${tableName}`);
        
        const dbRef = ref(getDatabase(), `/${tableName}`);
        
        const unsubscribe = onValue(dbRef,
          (snapshot) => {
            const data = snapshot.val();
            setTables(prevTables => ({
              ...prevTables,
              [tableName]: { data, isLoading: false, error: null }
            }));
          },
          (error) => {
            setTables(prevTables => ({
              ...prevTables,
              [tableName]: { data: prevTables[tableName]?.data || null, isLoading: false, error: error as Error }
            }));
          }
        );

        return { ...prev, [tableName]: { ref: dbRef, unsubscribe } };
      }
      return prev;
    });
  }, []);

  const unsubscribeFromTable = useCallback((tableName: string) => {
    setRefCounts(prev => {
      const newCount = (prev[tableName] || 1) - 1;
      
      if (newCount <= 0) {
        // Remove listener if no more subscribers
        console.log(`🗑️ Removing Firebase listener for: ${tableName}`);
        
        setListeners(prevListeners => {
          const listener = prevListeners[tableName];
          if (listener) {
            listener.unsubscribe();
          }
          
          const { [tableName]: removed, ...rest } = prevListeners;
          return rest;
        });
        
        const { [tableName]: removedCount, ...restCounts } = prev;
        return restCounts;
      }
      
      return { ...prev, [tableName]: newCount };
    });
  }, []);

  return (
    <FirebaseDataContext.Provider value={{ tables, subscribeToTable, unsubscribeFromTable }}>
      {children}
    </FirebaseDataContext.Provider>
  );
}

export function useFirebaseDataContext() {
  const context = useContext(FirebaseDataContext);
  if (!context) {
    throw new Error('useFirebaseDataContext must be used within a FirebaseDataProvider');
  }
  return context;
} 