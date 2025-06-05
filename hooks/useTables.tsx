import { getConvertedEmployeesData, getConvertedRevenueData, getConvertedWorkingDaysData } from '@/utils/dataUtils';
import { useMemo } from 'react';
import { useSharedFirebaseTable } from './useSharedFirebaseTable';

// Base table hooks - simple and clean (raw Firebase data)
export const useUsers = () => useSharedFirebaseTable('users');
export const useEmployees = () => useSharedFirebaseTable('employees');  
export const useWorkingDays = () => useSharedFirebaseTable('workingDays');
export const useRevenue = () => useSharedFirebaseTable('revenue');
export const useMonthSalary = () => useSharedFirebaseTable('monthSalary');
export const useWorkingHours = () => useSharedFirebaseTable('workingHours');

// Converted data hooks - apply transforms and cache results
export const useConvertedEmployees = () => {
  const { data: rawEmployees, isLoading, error } = useEmployees();
  
  const convertedData = useMemo(() => {
    return rawEmployees ? getConvertedEmployeesData(rawEmployees) : null;
  }, [rawEmployees]);
  
  return { data: convertedData, isLoading, error };
};

export const useConvertedWorkingDays = () => {
  const { data: rawWorkingDays, isLoading, error } = useWorkingDays();
  
  const convertedData = useMemo(() => {
    return rawWorkingDays ? getConvertedWorkingDaysData(rawWorkingDays) : null;
  }, [rawWorkingDays]);
  
  return { data: convertedData, isLoading, error };
};

export const useConvertedRevenue = () => {
  const { data: rawRevenue, isLoading, error } = useRevenue();
  
  const convertedData = useMemo(() => {
    return rawRevenue ? getConvertedRevenueData(rawRevenue) : null;
  }, [rawRevenue]);
  
  return { data: convertedData, isLoading, error };
};

// Export all hooks as an object for easier importing
export const useTables = {
  // Raw data hooks
  users: useUsers,
  employees: useEmployees,
  workingDays: useWorkingDays,
  revenue: useRevenue,
  monthSalary: useMonthSalary,
  workingHours: useWorkingHours,
  
  // Converted data hooks
  convertedEmployees: useConvertedEmployees,
  convertedWorkingDays: useConvertedWorkingDays,
  convertedRevenue: useConvertedRevenue,
} as const;

// Export table names for convenience
export const TABLE_NAMES = {
  USERS: 'users',
  EMPLOYEES: 'employees', 
  WORKING_DAYS: 'workingDays',
  REVENUE: 'revenue',
  MONTH_SALARY: 'monthSalary',
  WORKING_HOURS: 'workingHours'
} as const;