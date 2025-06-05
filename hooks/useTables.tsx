import { useSharedFirebaseTable } from './useSharedFirebaseTable';

// Individual table hooks
export const useUsers = () => useSharedFirebaseTable('users');
export const useEmployees = () => useSharedFirebaseTable('employees');  
export const useWorkingDays = () => useSharedFirebaseTable('workingDays');
export const useRevenue = () => useSharedFirebaseTable('revenue');
export const useMonthSalary = () => useSharedFirebaseTable('monthSalary');
export const useWorkingHours = () => useSharedFirebaseTable('workingHours');

// Optional: Export all hooks as an object for easier importing
export const useTables = {
  users: useUsers,
  employees: useEmployees,
  workingDays: useWorkingDays,
  revenue: useRevenue,
  monthSalary: useMonthSalary,
  workingHours: useWorkingHours,
};

// Optional: Export table names as constants
export const TABLE_NAMES = {
  USERS: 'users',
  EMPLOYEES: 'employees',
  WORKING_DAYS: 'workingDays',
  REVENUE: 'revenue',
  MONTH_SALARY: 'monthSalary',
  WORKING_HOURS: 'workingHours',
} as const;