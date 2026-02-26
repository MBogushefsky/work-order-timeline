import { TestBed } from '@angular/core/testing';
import { TimelineCalcService } from './timeline-calc.service';
import { DateRange, TimeScale } from '../models/timeline.model';

describe('TimelineCalcService', () => {
  let service: TimelineCalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineCalcService);
  });

  describe('getColumnWidth', () => {
    it('returns 60 for day scale', () => {
      expect(service.getColumnWidth('day')).toBe(60);
    });

    it('returns 120 for week scale', () => {
      expect(service.getColumnWidth('week')).toBe(120);
    });

    it('returns 180 for month scale', () => {
      expect(service.getColumnWidth('month')).toBe(180);
    });
  });

  describe('getVisibleRange', () => {
    it('returns a range with start before end for day scale', () => {
      const range = service.getVisibleRange('day');
      expect(range.start < range.end).toBe(true);
    });

    it('returns a range with start before end for week scale', () => {
      const range = service.getVisibleRange('week');
      expect(range.start < range.end).toBe(true);
    });

    it('returns a range with start before end for month scale', () => {
      const range = service.getVisibleRange('month');
      expect(range.start < range.end).toBe(true);
    });
  });

  describe('generateColumns', () => {
    it('generates day columns', () => {
      const range: DateRange = { start: '2025-06-01', end: '2025-06-07' };
      const cols = service.generateColumns(range, 'day');
      expect(cols.length).toBe(7); // 7 days inclusive
      expect(cols[0].date).toBe('2025-06-01');
      expect(cols[0].sublabel).toBeDefined(); // day-of-week abbreviation
    });

    it('generates week columns', () => {
      const range: DateRange = { start: '2025-06-01', end: '2025-06-30' };
      const cols = service.generateColumns(range, 'week');
      expect(cols.length).toBeGreaterThan(0);
      // Each column date should be a Monday
      cols.forEach(col => {
        const d = new Date(col.date + 'T00:00:00');
        expect(d.getDay()).toBe(1); // Monday
      });
    });

    it('generates month columns', () => {
      const range: DateRange = { start: '2025-01-01', end: '2025-06-30' };
      const cols = service.generateColumns(range, 'month');
      expect(cols.length).toBe(6);
      expect(cols[0].date).toBe('2025-01-01');
      expect(cols[5].date).toBe('2025-06-01');
    });
  });

  describe('dateToPixelOffset', () => {
    const range: DateRange = { start: '2025-06-01', end: '2025-06-30' };

    it('returns 0 for range start in day scale', () => {
      expect(service.dateToPixelOffset('2025-06-01', range, 'day')).toBe(0);
    });

    it('returns columnWidth * days for day scale', () => {
      // 5 days * 60px = 300px
      expect(service.dateToPixelOffset('2025-06-06', range, 'day')).toBe(300);
    });

    it('returns proportional offset for week scale', () => {
      // 7 days * (120/7) = 120px
      const offset = service.dateToPixelOffset('2025-06-08', range, 'week');
      expect(offset).toBeCloseTo(120, 0);
    });

    it('returns proportional offset for month scale', () => {
      const monthRange: DateRange = { start: '2025-01-01', end: '2025-12-31' };
      const offset = service.dateToPixelOffset('2025-07-01', monthRange, 'month');
      // 6 full months * 180px = 1080px
      expect(offset).toBeCloseTo(1080, 0);
    });
  });

  describe('pixelOffsetToDate', () => {
    const range: DateRange = { start: '2025-06-01', end: '2025-06-30' };

    it('returns range start for offset 0 in day scale', () => {
      expect(service.pixelOffsetToDate(0, range, 'day')).toBe('2025-06-01');
    });

    it('converts pixel offset back to date in day scale', () => {
      // 300px / 60px = 5 days
      expect(service.pixelOffsetToDate(300, range, 'day')).toBe('2025-06-06');
    });

    it('is inverse of dateToPixelOffset for day scale', () => {
      const testDate = '2025-06-15';
      const offset = service.dateToPixelOffset(testDate, range, 'day');
      expect(service.pixelOffsetToDate(offset, range, 'day')).toBe(testDate);
    });
  });

  describe('getBarPosition', () => {
    const range: DateRange = { start: '2025-06-01', end: '2025-06-30' };

    it('returns left and width in pixels', () => {
      const pos = service.getBarPosition('2025-06-05', '2025-06-10', range, 'day');
      expect(pos.left).toBe(4 * 60);  // 4 days from start
      expect(pos.width).toBe(5 * 60); // 5 days span
    });

    it('enforces minimum 20px width', () => {
      // Same start and end date = 0px span → should clamp to 20
      const pos = service.getBarPosition('2025-06-05', '2025-06-05', range, 'day');
      expect(pos.width).toBe(20);
    });
  });
});
