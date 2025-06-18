import { format, formatDistanceToNow, differenceInMonths } from 'date-fns';

export function formatArticleDate(date: Date): string {
  const now = new Date();
  if (differenceInMonths(now, date) >= 1) {
    return format(date, 'dd MMM yyyy');
  }
  return formatDistanceToNow(date, { addSuffix: true });
}
