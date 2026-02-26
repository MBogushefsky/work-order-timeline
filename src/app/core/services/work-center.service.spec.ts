import { TestBed } from '@angular/core/testing';
import { WorkCenterService } from './work-center.service';

describe('WorkCenterService', () => {
  let service: WorkCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkCenterService);
  });

  describe('getAll', () => {
    it('returns all 5 seed work centers', () => {
      const centers = service.getAll();
      expect(centers).toHaveLength(5);
    });

    it('returns centers with expected names', () => {
      const names = service.getAll().map(wc => wc.data.name);
      expect(names).toEqual([
        'Extrusion Line A',
        'CNC Machine 1',
        'Assembly Station',
        'Quality Control',
        'Packaging Line',
      ]);
    });
  });

  describe('getById', () => {
    it('finds a work center by docId', () => {
      const center = service.getById('wc-1');
      expect(center).toBeDefined();
      expect(center!.data.name).toBe('Extrusion Line A');
    });

    it('returns undefined for non-existent docId', () => {
      expect(service.getById('wc-999')).toBeUndefined();
    });
  });
});
