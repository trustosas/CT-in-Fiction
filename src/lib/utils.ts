import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseDatabaseDate = (dateStr: string) => {
  if (!dateStr) return null;
  
  try {
    let processedStr = dateStr;
    const dateParts = dateStr.split(' ')[0].split('/');
    if (dateParts.length === 3 && dateParts[2].length === 4) {
      const [m, d, y] = dateParts;
      const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      processedStr = dateStr.replace(dateStr.split(' ')[0], isoDate);
    }

    let normalizedStr = processedStr;
    if (!processedStr.includes('Z') && !/[+-]\d{2}:?\d{2}$/.test(processedStr)) {
      normalizedStr = processedStr.includes(' ') ? processedStr.replace(' ', 'T') + '+01:00' : processedStr;
    }
    
    let date = new Date(normalizedStr);
    if (isNaN(date.getTime())) {
      date = new Date(dateStr);
    }
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
};

export const formatDate = (dateStr: string) => {
  const date = parseDatabaseDate(dateStr);
  if (!date) return dateStr;
  
  const hasTime = dateStr.includes(' ') || dateStr.includes('T');
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  if (hasTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat(undefined, options).format(date);
};

export const getRelativeTime = (dateStr: string) => {
  const date = parseDatabaseDate(dateStr);
  if (!date) return '';
  return `(${formatDistanceToNow(date, { addSuffix: true })})`;
};

export const pluralize = (count: number, singular: string, plural?: string) => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};
