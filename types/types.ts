export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  WorkingDays: undefined;
  Salary: undefined;
  Employees: undefined;
  Revenue: undefined;
  Profile: undefined;
};

export type WorkingDaysParamList = {
  WorkingDaysScreen: undefined;
  WorkingDaysEmployeeFormScreen: undefined;
};

export type SalaryParamList = {
  SalaryScreen: undefined;
  SalaryDetailScreen: undefined;
  SalaryDetailEmployeeFormScreen: undefined;
  SalaryMonthScreen: undefined;
  SalaryMonthDetailScreen: undefined;
};

export type RevenueParamList = {
  RevenueScreen: undefined;
  RevenueCalculatorScreen: undefined;
};

export type ProfileParamList = {
  ProfileScreen: undefined;
  EmployeesScreen: undefined;
  EmployeesDetailFormScreen: undefined;
  EmployeesWorkdayFormScreen: undefined;
  ArchiveOverviewScreen: undefined;
  ArchiveRevenueDetailScreen: undefined;
};

export type EmployeeType = {
  id: string;
  name: string;
  salary: number;
  eveningSalary: number;
  extraDaySalary: number;
  disabled?: boolean;
  startDate?: string;
  endDate?: string;
  workingDays: WorkingDayType[];
  defaultWorkingDay: WorkingDayType;
};

export type SalaryByTypeType = {
  normalSalary: number;
  eveningSalary: number;
  extraDaySalary: number;
  total: number;
};

export type WorkingDayType = {
  name: string;
  isSaved?: boolean;
  hasWorked?: boolean;
  isExtraDay: boolean;
  needsCheck?: boolean;
  startTimeHours: number;
  startTimeMinutes: number;
  endTimeHours: number;
  endTimeMinutes: number;
  extractTimeHours: number;
  extractTimeMinutes: number;
  salary?: number;
  eveningSalary?: number;
  extraDaySalary?: number;
  id: string;
  workingDayId?: string;
  date?: string;
};

export type RevenueType = {
  id?: string;
  date: string;
  isAtmVerified: boolean;
  revenueAtm: number;
  revenueAtmFormula?: string;
  revenueCash: number;
  revenueCashFormula?: string;
};

export type ArchiveType = {
  [year: string]: RevenueType[];
};
