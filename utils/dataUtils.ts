import { capitalize } from "./stringUtils";
import {
  format,
  getFormattedStringFromDate,
  getParsedDateFromString,
  getWeekDays,
  getHoursWorked,
  getEveningHoursWorked,
  isEmployeeActiveInDateRange,
  isEmployeeActiveOnDate,
  formatString,
} from "./dateUtils";
import {
  getEmployeeSalaryPerTypeByMultipleDays,
  getEmployeeSalaryPerTypeByDay,
} from "./salaryUtils";
import { EmployeeType, WorkingDayType } from "../types/types";

export function getConvertedEmployeesData(firebaseEmployeesData: any): any[] {
  if (!firebaseEmployeesData) return [];

  const { employees } = Object.keys(firebaseEmployeesData).reduce(
    (acc: any, key: string) => {
      const {
        workingDays: workingDaysData,
        defaultWorkingDays: defaultWorkingDaysData,
        workingHours, // eslint-disable-line
        ...employee
      } = firebaseEmployeesData[key];

      // const employeeWorkingDays = workingDaysData
      //   ? Object.keys(workingDaysData).map((employeeWorkingDayKey) => ({
      //       employee,
      //       ...workingDaysData[employeeWorkingDayKey],
      //       id: employeeWorkingDayKey,
      //     }))
      //   : [];
      const defaultWorkingDays = defaultWorkingDaysData
        ? Object.keys(defaultWorkingDaysData).map((defaultWorkingDayKey) => ({
            ...defaultWorkingDaysData[defaultWorkingDayKey],
            id: defaultWorkingDayKey,
          }))
        : [];

      return {
        employees: [
          ...acc.employees,
          {
            ...employee,
            defaultWorkingDays,
            // workingDays: employeeWorkingDays,
          },
        ],
      };
    },
    {
      employees: [],
    }
  );

  return employees.sort((a, b) => (Number(a.order) < Number(b.order) ? -1 : 1));
}

export function getConvertedWorkingDaysData(firebaseWorkingDaysData: any) {
  return Object.keys(firebaseWorkingDaysData).map(
    (key) => firebaseWorkingDaysData[key]
  );
}

export function getConvertedRevenueData(firebaseRevenueData: any) {
  return Object.keys(firebaseRevenueData).map((key) => {
    const data = firebaseRevenueData[key];
    return {
      ...data,
      id: key,
    };
  });
}

export function getConvertedArchiveData(firebaseArchiveData: any) {
  return Object.keys(firebaseArchiveData).reduce((result, key) => {
    return {
      ...result,
      [key]: Object.keys(firebaseArchiveData[key]).reduce((result, year) => {
        const yearData = firebaseArchiveData[key][year];
        return {
          ...result,
          [year]: Object.keys(yearData).map((key) => {
            const dayData = yearData[key];

            return {
              ...dayData,
              id: key,
            };
          }),
        };
      }, {}),
    };
  }, {});
}

function getEmployeeWorkingHours(
  employees: any,
  workingHoursData: any,
  selectedDate: Date
) {
  return employees.map(
    ({ workingDays, defaultWorkingDays, ...employee }: any) => {
      const workingDay =
        workingHoursData[employee.id]?.[format(selectedDate, "yyyyMMdd")] ||
        null;

      const selectedDateName = capitalize(format(selectedDate, "EEEE"));
      const defaultWorkingDay =
        defaultWorkingDays?.find(
          ({ name }: WorkingDayType) => name === selectedDateName
        ) || null;

      return {
        ...employee,
        workingDay,
        defaultWorkingDay,
      };
    }
  );
}

function getEmployeeWorkingHoursByMultipleDays(
  employees: any,
  workingHoursData: any,
  selectedDates: Date[]
) {
  return employees.map((employee: any) => {
    const workingDaysList = selectedDates.reduce((res: any, date: any) => {
      const workingDay =
        workingHoursData[employee.id]?.[format(date, "yyyyMMdd")];

      return !!workingDay ? [...res, workingDay] : res;
    }, []);

    return {
      ...employee,
      workingDays: workingDaysList,
    };
  });
}

export function getWorkingDaysData(
  employeesData: any,
  workingHoursData: any,
  selectedDate: Date
) {
  // workingDay state for entire week (completed)
  const weekDays = getWeekDays(selectedDate);

  // employee workingHours for selectedDate(name, workingHours)
  const employees = getEmployeeWorkingHours(
    employeesData.filter((employee: EmployeeType) => {
      return (
        !employee.disabled && isEmployeeActiveOnDate(employee, selectedDate)
      );
    }),
    workingHoursData,
    selectedDate
  );

  return {
    employees,
    workingDays: weekDays.map((day) => {
      const workingHours = getEmployeeWorkingHours(
        employeesData,
        workingHoursData,
        day
      );
      const isNotComplete =
        workingHours.length === 0 ||
        getEmployeeWorkingHours(employeesData, workingHoursData, day).some(
          (employee: any) => {
            return !isEmployeeActiveOnDate(employee, day)
              ? false
              : !employee.workingDay;
          }
        );

      return {
        date: day,
        isComplete: !isNotComplete,
      };
    }),
  };
}

export function getEmployeeSalaryData(
  employeesData: any,
  workingHoursData: any,
  selectedDates: Date[]
) {
  const employees = getEmployeeWorkingHoursByMultipleDays(
    employeesData.filter(
      (employee: EmployeeType) =>
        !employee.disabled &&
        isEmployeeActiveInDateRange(employee, selectedDates)
    ),
    workingHoursData,
    selectedDates
  );

  return {
    employees: employees.map((employee: any) => ({
      ...employee,
      salary: getEmployeeSalaryPerTypeByMultipleDays(
        employee,
        employee.workingDays
      ),
    })),
    workingDays: selectedDates.map((day) => {
      const workingHours = getEmployeeWorkingHours(
        employeesData,
        workingHoursData,
        day
      );
      const isNotComplete =
        workingHours.length === 0 ||
        getEmployeeWorkingHours(employeesData, workingHoursData, day).some(
          (employee: any) => {
            return !isEmployeeActiveOnDate(employee, day)
              ? false
              : !employee.workingDay;
          }
        );

      return {
        date: day,
        isComplete: !isNotComplete,
      };
    }),
  };
}

export function getEmployeeSalaryDetailData(
  employee: any,
  workingHoursData: any,
  selectedDates: Date[]
) {
  const employeeWorkingHoursByMutipleDays =
    getEmployeeWorkingHoursByMultipleDays(
      [employee],
      workingHoursData,
      selectedDates
    );

  const workingDays = selectedDates.map((date) => {
    const workingDay = workingHoursData[employee.id][format(date, "yyyyMMdd")];

    if (workingDay) {
      const totalHoursWorked = getHoursWorked(workingDay);
      const eveningHoursWorked = getEveningHoursWorked(workingDay);
      const normalHoursWorked = totalHoursWorked - eveningHoursWorked;

      return {
        ...workingDay,
        dateString: capitalize(
          format(getParsedDateFromString(workingDay.date), "EEEEEE dd MMM yyyy")
        ),
        normalHoursWorked,
        eveningHoursWorked,
        hoursWorked: totalHoursWorked,
        calculated: getEmployeeSalaryPerTypeByDay(employee, workingDay),
        indicatorColor: "green",
        isSaved: true,
      };
    }

    const dateName = capitalize(format(date, "EEEE"));
    const defaultWorkingDay =
      employee.defaultWorkingDays?.find(
        ({ name }: WorkingDayType) => name === dateName
      ) || null;

    return {
      employee,
      date: getFormattedStringFromDate(date),
      dateString: capitalize(format(date, "EEEEEE dd MMM yyyy")),
      normalHoursWorked: 0,
      eveningHoursWorked: 0,
      hoursWorked: 0,
      calculated: {
        normalSalary: 0,
        eveningSalary: 0,
        extraDaySalary: 0,
        total: 0,
      },
      defaultWorkingDay,
      isSaved: false,
    };
  });

  return {
    employee: employeeWorkingHoursByMutipleDays.map((employeeItem: any) => ({
      ...employeeItem,
      workingDays,
    }))?.[0],
    salary: getEmployeeSalaryPerTypeByMultipleDays(employee, workingDays),
  };
}

export function getSalaryDataBetweenDates(
  firebaseData: any,
  workingHoursData: any,
  startDate: Date,
  endDate: Date
) {
  const allDates = getDaysBetweenDates(startDate, endDate);
  return getEmployeeSalaryData(firebaseData, workingHoursData, allDates);
}

export function getEmployeeSalaryDataBetweenDates(
  employee: any,
  workingHoursData: any,
  startDate: Date,
  endDate: Date
) {
  const allDates = getDaysBetweenDates(startDate, endDate);
  return getEmployeeSalaryDetailData(employee, workingHoursData, allDates);
}

export function getEmployeeMonthSalaryDetails(
  firebaseData: any,
  employee: any,
  workingHoursData: any,
  startDate: Date,
  endDate: Date
) {
  return {
    salary: getSalaryDataBetweenDatesGroupedPerWeek(
      employee,
      workingHoursData,
      startDate,
      endDate
    ),
    extras: getEmployeeMonthExtraData(firebaseData, employee),
  };
}

function getEmployeeMonthExtraData(firebaseData: any, employee: any) {
  return firebaseData.monthSalary.extras[employee.id] || [];
}

export function getSalaryDataBetweenDatesGroupedPerWeek(
  employee: any,
  workingHoursData: any,
  startDate: Date,
  endDate: Date
) {
  const weeks = groupDaysByWeek(startDate, endDate);
  return weeks.map((week) => {
    const firstDayOfWeek = week[0];
    const lastDayOfWeek = week[week.length - 1];
    return {
      title: `${format(firstDayOfWeek, "dd MMM").slice(0, 6)} - ${format(
        lastDayOfWeek,
        "dd MMM"
      ).slice(0, 6)}`,
      salary: getEmployeeSalaryDataBetweenDates(
        employee,
        workingHoursData,
        firstDayOfWeek,
        lastDayOfWeek
      ).employee.workingDays.reduce((res: any, day: any) => {
        return res + Number(day.calculated.total);
      }, 0),
    };
  });
}

function getDaysBetweenDates(startDate: Date, endDate: Date) {
  var days = [];
  var date = new Date(startDate);

  while (date <= endDate) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

function groupDaysByWeek(startDate: Date, endDate: Date) {
  var date = new Date(startDate);
  var end = new Date(endDate);

  // Set the date to the previous Monday
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));

  var weeks = [];
  var currentWeek = [];

  while (date <= end) {
    // Add the current date to the current week
    currentWeek.push(new Date(date));

    // Move to the next day
    date.setDate(date.getDate() + 1);

    // If it's Monday, start a new week
    if (date.getDay() === 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add the last week, if it's not empty
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

export function getRevenueData(revenueData: any) {
  return revenueData.reduce((res: any, item: any) => {
    return {
      ...res,
      [formatString(item.date, "dd-MM-yyyy", "yyyy-MM-dd")]: item,
    };
  }, {});
}
