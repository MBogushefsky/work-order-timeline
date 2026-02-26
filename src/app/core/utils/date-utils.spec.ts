import {
  isoToNgbDate,
  ngbDateToIso,
  todayIso,
  addDays,
  differenceInDays,
  addMonths,
  startOfMonth,
  startOfWeek,
  daysInMonth,
  formatDateHeader,
  formatMonthYear,
  dayOfWeekAbbr,
} from './date-utils';

describe('date-utils', () => {

  describe('isoToNgbDate', () => {
    it('converts ISO string to NgbDateStruct', () => {
      expect(isoToNgbDate('2025-03-15')).toEqual({ year: 2025, month: 3, day: 15 });
    });

    it('handles single-digit month and day', () => {
      expect(isoToNgbDate('2025-01-05')).toEqual({ year: 2025, month: 1, day: 5 });
    });
  });

  describe('ngbDateToIso', () => {
    it('converts NgbDateStruct to ISO string with zero-padded month/day', () => {
      expect(ngbDateToIso({ year: 2025, month: 3, day: 5 })).toBe('2025-03-05');
    });

    it('handles double-digit month and day', () => {
      expect(ngbDateToIso({ year: 2025, month: 12, day: 25 })).toBe('2025-12-25');
    });
  });

  describe('todayIso', () => {
    it('returns today in YYYY-MM-DD format', () => {
      const result = todayIso();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Should match JS Date's ISO output
      expect(result).toBe(new Date().toISOString().slice(0, 10));
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      expect(addDays('2025-01-01', 10)).toBe('2025-01-11');
    });

    it('subtracts days with negative value', () => {
      expect(addDays('2025-01-11', -10)).toBe('2025-01-01');
    });

    it('crosses month boundary', () => {
      expect(addDays('2025-01-30', 5)).toBe('2025-02-04');
    });

    it('crosses year boundary', () => {
      expect(addDays('2025-12-30', 5)).toBe('2026-01-04');
    });
  });

  describe('differenceInDays', () => {
    it('returns positive difference when a > b', () => {
      expect(differenceInDays('2025-01-10', '2025-01-01')).toBe(9);
    });

    it('returns negative difference when a < b', () => {
      expect(differenceInDays('2025-01-01', '2025-01-10')).toBe(-9);
    });

    it('returns 0 for same date', () => {
      expect(differenceInDays('2025-06-15', '2025-06-15')).toBe(0);
    });
  });

  describe('addMonths', () => {
    it('adds months', () => {
      expect(addMonths('2025-01-15', 2)).toBe('2025-03-15');
    });

    it('subtracts months with negative value', () => {
      expect(addMonths('2025-03-15', -2)).toBe('2025-01-15');
    });

    it('crosses year boundary', () => {
      expect(addMonths('2025-11-15', 3)).toBe('2026-02-15');
    });

    it('clamps Jan 31 + 1 month to Feb 28 (non-leap)', () => {
      expect(addMonths('2025-01-31', 1)).toBe('2025-02-28');
    });

    it('clamps Jan 31 + 1 month to Feb 29 (leap year)', () => {
      expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    });

    it('clamps Mar 31 + 1 month to Apr 30', () => {
      expect(addMonths('2025-03-31', 1)).toBe('2025-04-30');
    });

    it('handles adding months to end-of-month dates', () => {
      expect(addMonths('2025-08-31', 1)).toBe('2025-09-30');
    });
  });

  describe('startOfMonth', () => {
    it('returns first day of the month', () => {
      expect(startOfMonth('2025-06-15')).toBe('2025-06-01');
    });

    it('returns same date if already first', () => {
      expect(startOfMonth('2025-06-01')).toBe('2025-06-01');
    });
  });

  describe('startOfWeek', () => {
    // 2025-06-16 is a Monday
    it('returns same date for Monday', () => {
      expect(startOfWeek('2025-06-16')).toBe('2025-06-16');
    });

    // 2025-06-18 is a Wednesday
    it('returns Monday for mid-week date', () => {
      expect(startOfWeek('2025-06-18')).toBe('2025-06-16');
    });

    // 2025-06-22 is a Sunday
    it('returns previous Monday for Sunday', () => {
      expect(startOfWeek('2025-06-22')).toBe('2025-06-16');
    });
  });

  describe('daysInMonth', () => {
    it('returns 31 for January', () => {
      expect(daysInMonth('2025-01-15')).toBe(31);
    });

    it('returns 28 for February (non-leap)', () => {
      expect(daysInMonth('2025-02-10')).toBe(28);
    });

    it('returns 29 for February (leap year)', () => {
      expect(daysInMonth('2024-02-10')).toBe(29);
    });

    it('returns 30 for April', () => {
      expect(daysInMonth('2025-04-01')).toBe(30);
    });
  });

  describe('formatDateHeader', () => {
    it('day scale: returns day number', () => {
      expect(formatDateHeader('2025-06-15', 'day')).toBe('15');
    });

    it('week scale: returns "Mon DD - DD" range', () => {
      const result = formatDateHeader('2025-06-16', 'week');
      expect(result).toBe('Jun 16 - 22');
    });

    it('week scale: shows both months when range crosses month boundary', () => {
      // 2025-06-30 is a Monday, end is Jul 6
      const result = formatDateHeader('2025-06-30', 'week');
      expect(result).toBe('Jun 30 - Jul 6');
    });

    it('month scale: returns "Mon YYYY"', () => {
      expect(formatDateHeader('2025-06-15', 'month')).toBe('Jun 2025');
    });
  });

  describe('formatMonthYear', () => {
    it('returns "Mon YYYY" format', () => {
      expect(formatMonthYear('2025-06-15')).toBe('Jun 2025');
    });

    it('returns correct month for January', () => {
      expect(formatMonthYear('2025-01-01')).toBe('Jan 2025');
    });
  });

  describe('dayOfWeekAbbr', () => {
    it('returns Mon for a Monday', () => {
      expect(dayOfWeekAbbr('2025-06-16')).toBe('Mon');
    });

    it('returns Sun for a Sunday', () => {
      expect(dayOfWeekAbbr('2025-06-22')).toBe('Sun');
    });

    it('returns Wed for a Wednesday', () => {
      expect(dayOfWeekAbbr('2025-06-18')).toBe('Wed');
    });
  });
});
