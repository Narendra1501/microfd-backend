import { getISOWeek } from 'date-fns';

export const getDisplayWeek = (dateString) => {
    const date = new Date(dateString);
    return getISOWeek(date);
};

export const getDisplayWeekFromMetadata = (weekNumber, year) => {
    return weekNumber;
};
