
import { parse, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Parses a week string like "DD/MM/YY au DD/MM/YY" into start and end dates.
 * @param weekString The string representing the week.
 * @returns An object with start and end Date objects, or null if parsing fails.
 */
export const parseWeekString = (weekString: string): { start: Date; end: Date } | null => {
  try {
    const parts = weekString.split(' au ');
    if (parts.length !== 2) return null;

    const startDate = parse(parts[0], 'dd/MM/yy', new Date());
    const endDate = parse(parts[1], 'dd/MM/yy', new Date());

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null;
    }

    return { start: startOfDay(startDate), end: endOfDay(endDate) };
  } catch (error) {
    console.error("Error parsing week string:", weekString, error);
    return null;
  }
};

/**
 * Checks if a given date is within a week defined by a week string.
 * @param date The date to check.
 * @param weekString The string representing the week.
 * @returns True if the date is within the week, false otherwise.
 */
export const isDateInWeek = (date: Date, weekString: string): boolean => {
  const interval = parseWeekString(weekString);
  if (!interval) return false;
  return isWithinInterval(date, interval);
};
