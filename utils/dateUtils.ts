import {
  addDays,
  format as _format,
  parse,
  startOfWeek,
  startOfMonth,
  getDaysInMonth,
} from "date-fns";
import { nl } from "date-fns/locale/nl";
import { padStart } from "./stringUtils";
import { EmployeeType, WorkingDayType } from "../types/types";

const formatOptions = { timeZone: "Europe/Paris", locale: nl };

export function format(date: Date, dateFormat: string): string {
  return _format(date, dateFormat, formatOptions);
}

export function formatString(
  date: string,
  dateFormat: string,
  targetDateFormat?: string
): string {
  return _format(
    getParsedDateFromString(date, dateFormat),
    targetDateFormat || "dd-MM-yyyy",
    formatOptions
  );
}

export function getParsedDateFromString(date: string, format?: string): Date {
  return parse(date, format || "dd-MM-yyyy", new Date());
}

export function getFormattedStringFromDate(date: Date): string {
  return format(date, "dd-MM-yyyy");
}

export function getWorkingHoursString(
  workingDay: WorkingDayType,
  skipSavedCheck = false
): string {
  if (!workingDay || (!workingDay.isSaved && !skipSavedCheck)) return "-";

  if (!workingDay.hasWorked) return "Vrij";

  const workingHoursString = `${padStart(
    workingDay.startTimeHours,
    2,
    "0"
  )}:${padStart(workingDay.startTimeMinutes, 2, "0")} - ${padStart(
    workingDay.endTimeHours,
    2,
    "0"
  )}:${padStart(workingDay.endTimeMinutes, 2, "0")}`;

  const hasExtractTime = !!(
    workingDay.extractTimeHours || workingDay.extractTimeMinutes
  );
  if (hasExtractTime) {
    return `${workingHoursString} (-${workingDay.extractTimeHours}:${padStart(
      workingDay.extractTimeMinutes,
      2,
      "0"
    )})`;
  }

  return workingHoursString;
}

export function getWeekDays(date: Date | string = new Date()): Date[] {
  const parsedDate =
    typeof date === "string" ? getParsedDateFromString(date) : date;

  return Array(7)
    .fill(null)
    .map((_, index) =>
      addDays(startOfWeek(parsedDate, { weekStartsOn: 1 }), index)
    );
}

export function getMonthDays(date: Date | string = new Date()): Date[] {
  const parsedDate: Date =
    typeof date === "string" ? getParsedDateFromString(date) : date;

  return Array(getDaysInMonth(parsedDate))
    .fill(null)
    .map((_, index) => addDays(startOfMonth(parsedDate), index));
}

export function getHoursDifference(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(":");
  const [endHours, endMinutes] = endTime.split(":");

  const startTimeInDecimals = Number(startHours) + Number(startMinutes) / 60;
  const endTimeInDecimals = Number(endHours) + Number(endMinutes) / 60;

  return Math.round((endTimeInDecimals - startTimeInDecimals) * 100) / 100;
}

export function getHoursWorked(workingDay: WorkingDayType): number {
  if (!workingDay.isSaved || !workingDay.hasWorked) {
    return 0;
  }

  const {
    startTimeHours,
    startTimeMinutes,
    endTimeHours,
    endTimeMinutes,
    extractTimeHours,
    extractTimeMinutes,
  } = workingDay;

  const timeWorked = getHoursDifference(
    `${startTimeHours}:${startTimeMinutes}`,
    `${endTimeHours}:${endTimeMinutes}`
  );

  if (!!extractTimeHours || !!extractTimeMinutes) {
    const hoursWorked = Math.floor(timeWorked);
    const minutesWorked = (timeWorked % 1) * 60;

    return getHoursDifference(
      `${extractTimeHours}:${extractTimeMinutes}`,
      `${hoursWorked}:${minutesWorked}`
    );
  }

  return timeWorked;
}

export function getHoursWorkedByMultipleDays(
  workingDays: WorkingDayType[]
): number {
  return workingDays.reduce(
    (acc, workingDay) => acc + getHoursWorked(workingDay),
    0
  );
}

// Note: not taking into account extracted hours in evening!
export function getEveningHoursWorked(workingDay: WorkingDayType): number {
  if (!workingDay.isSaved || !workingDay.hasWorked || !!workingDay.isExtraDay) {
    return 0;
  }

  const { endTimeHours, endTimeMinutes } = workingDay;

  if (endTimeHours > 18 || (endTimeHours === 18 && endTimeMinutes > 0)) {
    return getHoursDifference(`18:00`, `${endTimeHours}:${endTimeMinutes}`);
  }

  return 0;
}

export function getHoursWorkedStringFromNumber(hoursWorked: number): string {
  return `${Math.floor(hoursWorked)}u ${Math.round((hoursWorked % 1) * 60)}m`;
}

export function getDaysWorkedStringFromNumber(hoursWorked: number): string {
  return `${Math.floor(hoursWorked / 8)}d ${Math.floor(
    hoursWorked % 8
  )}u ${Math.round((hoursWorked % 1) * 60)}m`;
}

export function isEmployeeActiveOnDate(employee: EmployeeType, date: Date) {
  if (employee.startDate && getParsedDateFromString(employee.startDate) > date)
    return false;
  if (employee.endDate && getParsedDateFromString(employee.endDate) < date)
    return false;

  return true;
}

export function isEmployeeActiveInDateRange(
  employee: EmployeeType,
  dates: Date[]
) {
  if (
    employee.startDate &&
    dates.every((date) => getParsedDateFromString(employee.startDate!) > date)
  )
    return false;
  if (
    employee.endDate &&
    dates.every((date) => getParsedDateFromString(employee.endDate!) < date)
  )
    return false;

  return true;
}
