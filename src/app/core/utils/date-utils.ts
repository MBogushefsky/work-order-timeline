import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

/** Convert ISO "YYYY-MM-DD" to NgbDateStruct */
export function isoToNgbDate(iso: string): NgbDateStruct {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

/** Convert NgbDateStruct to ISO "YYYY-MM-DD" */
export function ngbDateToIso(d: NgbDateStruct): string {
  const mm = String(d.month).padStart(2, '0');
  const dd = String(d.day).padStart(2, '0');
  return `${d.year}-${mm}-${dd}`;
}

/** Get today as ISO string */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Add days to an ISO date string */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Difference in calendar days between two ISO dates */
export function differenceInDays(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

/** Add months to an ISO date string */
export function addMonths(iso: string, months: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** Get the first day of the month for an ISO date */
export function startOfMonth(iso: string): string {
  return iso.slice(0, 7) + '-01';
}

/** Get the first day of the week (Monday) for an ISO date */
export function startOfWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDay();
  // getDay: 0=Sun, 1=Mon, ... 6=Sat -> shift to Mon=0
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** Get number of days in a month given an ISO date */
export function daysInMonth(iso: string): number {
  const d = new Date(iso + 'T00:00:00');
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Format date for column header display */
export function formatDateHeader(iso: string, scale: 'day' | 'week' | 'month'): string {
  const d = new Date(iso + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (scale) {
    case 'day':
      return `${d.getDate()}`;
    case 'week': {
      const end = new Date(d);
      end.setDate(end.getDate() + 6);
      return `${months[d.getMonth()]} ${d.getDate()} - ${end.getDate()}`;
    }
    case 'month':
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}

/** Get the month/year label for day view sublabels */
export function formatMonthYear(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Get the day of week abbreviation */
export function dayOfWeekAbbr(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
}
