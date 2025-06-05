import { useEffect } from 'react';
import { useFirebaseDataContext } from '../context/FirebaseDataContext';

interface UseSharedFirebaseTableResult {
  data: any;
  isLoading: boolean;
  error: Error | null;
}

export function useSharedFirebaseTable(tableName: string): UseSharedFirebaseTableResult {
  const { tables, subscribeToTable, unsubscribeFromTable } = useFirebaseDataContext();

  useEffect(() => {
    subscribeToTable(tableName);

    return () => {
      unsubscribeFromTable(tableName);
    };
  }, [tableName]);

  const tableData = tables[tableName] || { data: null, isLoading: true, error: null };

  return {
    data: tableData.data,
    isLoading: tableData.isLoading,
    error: tableData.error
  };
}