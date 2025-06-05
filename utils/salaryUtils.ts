import { getHoursWorked, getEveningHoursWorked } from "./dateUtils";
import { EmployeeType, SalaryByTypeType, WorkingDayType } from "../types/types";

export function getEmployeeNormalSalaryByDay(
  employee: EmployeeType,
  workingDay: WorkingDayType
): number {
  if (workingDay?.isExtraDay) {
    return 0;
  }

  const totalHoursWorked = getHoursWorked(workingDay);
  const eveningHoursWorked = getEveningHoursWorked(workingDay);
  const normalHoursWorked = totalHoursWorked - eveningHoursWorked;
  const salary =
    (normalHoursWorked / 8) * (workingDay.salary || employee.salary);
  return salary;
}

export function getEmployeeEveningSalaryByDay(
  employee: EmployeeType,
  workingDay: WorkingDayType
): number {
  if (workingDay.isExtraDay) {
    return 0;
  }

  const eveningHoursWorked = getEveningHoursWorked(workingDay);

  const salary =
    eveningHoursWorked * (workingDay.eveningSalary || employee.eveningSalary);
  return salary;
}

// TODO: check if evening hours is calculated for extra days?
export function getEmployeeExtraDaySalaryByDay(
  employee: EmployeeType,
  workingDay: WorkingDayType
): number {
  if (!workingDay.isExtraDay) {
    return 0;
  }

  const totalHoursWorked = getHoursWorked(workingDay);
  const eveningHoursWorked = getEveningHoursWorked(workingDay);
  const normalHoursWorked = totalHoursWorked - eveningHoursWorked;

  const salary =
    (normalHoursWorked / 8) *
    (workingDay.extraDaySalary || employee.extraDaySalary);
  return salary;
}

export function getEmployeeSalaryPerTypeByDay(
  employee: EmployeeType,
  workingDay: WorkingDayType
): SalaryByTypeType {
  const normalSalary = getEmployeeNormalSalaryByDay(employee, workingDay);
  const eveningSalary = getEmployeeEveningSalaryByDay(employee, workingDay);
  const extraDaySalary = getEmployeeExtraDaySalaryByDay(employee, workingDay);

  return {
    normalSalary: Math.round(normalSalary),
    eveningSalary: Math.round(eveningSalary),
    extraDaySalary: Math.round(extraDaySalary),
    total:
      Math.round(normalSalary) +
      Math.round(eveningSalary) +
      Math.round(extraDaySalary),
  };
}

export function getEmployeeSalaryPerTypeByMultipleDays(
  employee: EmployeeType,
  workingDays: WorkingDayType[]
): SalaryByTypeType {
  const { normalSalary, eveningSalary, extraDaySalary } = workingDays.reduce(
    (acc, workingDay) => ({
      normalSalary:
        acc.normalSalary +
        Math.round(getEmployeeNormalSalaryByDay(employee, workingDay)),
      eveningSalary:
        acc.eveningSalary +
        Math.round(getEmployeeEveningSalaryByDay(employee, workingDay)),
      extraDaySalary:
        acc.extraDaySalary +
        Math.round(getEmployeeExtraDaySalaryByDay(employee, workingDay)),
    }),
    {
      normalSalary: 0,
      eveningSalary: 0,
      extraDaySalary: 0,
    }
  );

  return {
    normalSalary: Math.round(normalSalary),
    eveningSalary: Math.round(eveningSalary),
    extraDaySalary: Math.round(extraDaySalary),
    total:
      Math.round(normalSalary) +
      Math.round(eveningSalary) +
      Math.round(extraDaySalary),
  };
}
