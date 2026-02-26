import { Injectable } from '@angular/core';
import { TimeScale, DateRange, ColumnDef } from '../models/timeline.model';
import {
  todayIso,
  addDays,
  addMonths,
  differenceInDays,
  startOfWeek,
  startOfMonth,
  daysInMonth,
  formatDateHeader,
  dayOfWeekAbbr,
  formatMonthYear,
} from '../utils/date-utils';

@Injectable({ providedIn: 'root' })
export class TimelineCalcService {

  getColumnWidth(scale: TimeScale): number {
    switch (scale) {
      case 'day':   return 60;
      case 'week':  return 120;
      case 'month': return 180;
    }
  }

  /** Compute the visible date range centered on today with buffer for each timescale */
  getVisibleRange(scale: TimeScale): DateRange {
    const today = todayIso();
    switch (scale) {
      case 'day':
        return { start: addDays(today, -14), end: addDays(today, 14) };
      case 'week':
        return { start: addDays(today, -56), end: addDays(today, 56) };
      case 'month':
        return { start: addMonths(today, -6), end: addMonths(today, 6) };
    }
  }

  /** Maximum number of columns to prevent unbounded memory growth */
  getMaxColumns(scale: TimeScale): number {
    switch (scale) {
      case 'day':   return 730;  // ~2 years
      case 'week':  return 104;  // ~2 years
      case 'month': return 24;   // 2 years
    }
  }

  /** Expand a date range in the given direction using the same buffer as the initial range */
  expandRange(range: DateRange, scale: TimeScale, direction: 'left' | 'right'): DateRange {
    switch (scale) {
      case 'day':
        return direction === 'left'
          ? { start: addDays(range.start, -14), end: range.end }
          : { start: range.start, end: addDays(range.end, 14) };
      case 'week':
        return direction === 'left'
          ? { start: addDays(range.start, -56), end: range.end }
          : { start: range.start, end: addDays(range.end, 56) };
      case 'month':
        return direction === 'left'
          ? { start: addMonths(range.start, -6), end: range.end }
          : { start: range.start, end: addMonths(range.end, 6) };
    }
  }

  /** Generate column definitions for the header row */
  generateColumns(range: DateRange, scale: TimeScale): ColumnDef[] {
    const columns: ColumnDef[] = [];

    switch (scale) {
      case 'day': {
        let current = range.start;
        while (current <= range.end) {
          columns.push({
            label: formatDateHeader(current, 'day'),
            sublabel: dayOfWeekAbbr(current),
            date: current,
          });
          current = addDays(current, 1);
        }
        break;
      }
      case 'week': {
        let current = startOfWeek(range.start);
        while (current <= range.end) {
          columns.push({
            label: formatDateHeader(current, 'week'),
            date: current,
          });
          current = addDays(current, 7);
        }
        break;
      }
      case 'month': {
        let current = startOfMonth(range.start);
        while (current <= range.end) {
          columns.push({
            label: formatDateHeader(current, 'month'),
            date: current,
          });
          current = addMonths(current, 1);
        }
        break;
      }
    }
    return columns;
  }

  /**
   * Convert an ISO date to a pixel offset from the range start.
   * Day:   daysBetween(rangeStart, date) * 60
   * Week:  daysBetween(rangeStart, date) * (120/7)
   * Month: (fullMonths + dayOfMonth/daysInMonth) * 180
   */
  // @upgrade: Consider using date-fns or luxon for more robust date calculations
  dateToPixelOffset(isoDate: string, range: DateRange, scale: TimeScale): number {
    const colWidth = this.getColumnWidth(scale);

    switch (scale) {
      case 'day': {
        const days = differenceInDays(isoDate, range.start);
        return days * colWidth;
      }
      case 'week': {
        const days = differenceInDays(isoDate, range.start);
        return days * (colWidth / 7);
      }
      case 'month': {
        // Calculate fractional months from range start
        const rangeStartDate = new Date(range.start + 'T00:00:00');
        const targetDate = new Date(isoDate + 'T00:00:00');

        const monthsDiff =
          (targetDate.getFullYear() - rangeStartDate.getFullYear()) * 12 +
          (targetDate.getMonth() - rangeStartDate.getMonth());

        // Fractional part: how far into the current month
        const dayFraction = (targetDate.getDate() - 1) / daysInMonth(isoDate);

        // Subtract the fractional part of the range start month
        const startDayFraction = (rangeStartDate.getDate() - 1) / daysInMonth(range.start);

        return (monthsDiff + dayFraction - startDayFraction) * colWidth;
      }
    }
  }

  /**
   * Convert a pixel offset back to an ISO date.
   * Inverse of dateToPixelOffset.
   */
  pixelOffsetToDate(offsetPx: number, range: DateRange, scale: TimeScale): string {
    const colWidth = this.getColumnWidth(scale);

    switch (scale) {
      case 'day': {
        const days = Math.round(offsetPx / colWidth);
        return addDays(range.start, days);
      }
      case 'week': {
        const days = Math.round(offsetPx / (colWidth / 7));
        return addDays(range.start, days);
      }
      case 'month': {
        const fractionalMonths = offsetPx / colWidth;
        const rangeStartDate = new Date(range.start + 'T00:00:00');
        const startDayFraction = (rangeStartDate.getDate() - 1) / daysInMonth(range.start);
        const totalMonths = fractionalMonths + startDayFraction;

        const wholeMonths = Math.floor(totalMonths);
        const result = addMonths(startOfMonth(range.start), wholeMonths);
        const dayFrac = totalMonths - wholeMonths;
        const daysToAdd = Math.round(dayFrac * daysInMonth(result));
        return addDays(result, daysToAdd);
      }
    }
  }

  /** Get left position and width in pixels for a work order bar */
  getBarPosition(
    startDate: string,
    endDate: string,
    range: DateRange,
    scale: TimeScale
  ): { left: number; width: number } {
    const left = this.dateToPixelOffset(startDate, range, scale);
    const right = this.dateToPixelOffset(endDate, range, scale);
    // Minimum 20px width for clickability
    const width = Math.max(right - left, 20);
    return { left, width };
  }
}
