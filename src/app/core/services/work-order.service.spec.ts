import { TestBed } from '@angular/core/testing';
import { WorkOrderService } from './work-order.service';
import { WorkOrderDocument } from '../models/work-order.model';

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAll', () => {
    it('returns seed data when localStorage is empty', () => {
      const orders = service.getAll();
      expect(orders.length).toBeGreaterThan(0);
    });
  });

  describe('getByWorkCenter', () => {
    it('filters orders by work center ID', () => {
      const orders = service.getByWorkCenter('wc-1');
      orders.forEach(o => {
        expect(o.data.workCenterId).toBe('wc-1');
      });
    });

    it('returns empty array for non-existent work center', () => {
      expect(service.getByWorkCenter('wc-999')).toEqual([]);
    });
  });

  describe('create', () => {
    it('adds a new work order', () => {
      const initialCount = service.getAll().length;
      service.create({
        name: 'Test Order',
        workCenterId: 'wc-1',
        status: 'open',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
      });
      expect(service.getAll().length).toBe(initialCount + 1);
    });

    it('emits updated list via workOrders$', (done) => {
      const initialCount = service.getAll().length;
      service.create({
        name: 'Test Order',
        workCenterId: 'wc-1',
        status: 'open',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
      });
      service.workOrders$.subscribe(orders => {
        if (orders.length === initialCount + 1) {
          expect(orders[orders.length - 1].data.name).toBe('Test Order');
          done();
        }
      });
    });

    it('persists to localStorage', () => {
      service.create({
        name: 'Persisted Order',
        workCenterId: 'wc-2',
        status: 'open',
        startDate: '2025-07-01',
        endDate: '2025-07-10',
      });
      const stored = JSON.parse(localStorage.getItem('work-orders')!) as WorkOrderDocument[];
      expect(stored.some(o => o.data.name === 'Persisted Order')).toBe(true);
    });
  });

  describe('update', () => {
    it('updates an existing work order', () => {
      const first = service.getAll()[0];
      service.update(first.docId, { name: 'Updated Name' });
      const updated = service.getAll().find(o => o.docId === first.docId);
      expect(updated!.data.name).toBe('Updated Name');
    });

    it('preserves other fields when partially updating', () => {
      const first = service.getAll()[0];
      const originalStatus = first.data.status;
      service.update(first.docId, { name: 'Partial Update' });
      const updated = service.getAll().find(o => o.docId === first.docId);
      expect(updated!.data.status).toBe(originalStatus);
    });
  });

  describe('delete', () => {
    it('removes a work order by docId', () => {
      const first = service.getAll()[0];
      const initialCount = service.getAll().length;
      service.delete(first.docId);
      expect(service.getAll().length).toBe(initialCount - 1);
      expect(service.getAll().find(o => o.docId === first.docId)).toBeUndefined();
    });
  });

  describe('hasOverlap', () => {
    it('detects overlap with existing order', () => {
      const orders = service.getByWorkCenter('wc-1');
      if (orders.length > 0) {
        const existing = orders[0];
        // An order that starts before the existing one ends
        expect(
          service.hasOverlap('wc-1', existing.data.startDate, existing.data.endDate)
        ).toBe(true);
      }
    });

    it('returns false when no overlap exists', () => {
      expect(
        service.hasOverlap('wc-1', '2099-01-01', '2099-01-10')
      ).toBe(false);
    });

    it('excludes a specific docId from overlap check', () => {
      const orders = service.getByWorkCenter('wc-1');
      if (orders.length > 0) {
        const existing = orders[0];
        // Same dates but excluding itself should not count as overlap
        const otherOrders = orders.filter(o => o.docId !== existing.docId);
        const hasOtherOverlap = otherOrders.some(
          o => existing.data.startDate < o.data.endDate && o.data.startDate < existing.data.endDate
        );
        expect(
          service.hasOverlap(
            'wc-1',
            existing.data.startDate,
            existing.data.endDate,
            existing.docId
          )
        ).toBe(hasOtherOverlap);
      }
    });
  });

  describe('localStorage loading', () => {
    it('loads from localStorage when valid data exists', () => {
      const testOrders: WorkOrderDocument[] = [{
        docId: 'test-1',
        docType: 'workOrder',
        data: {
          name: 'Stored Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2025-07-01',
          endDate: '2025-07-10',
        },
      }];
      localStorage.setItem('work-orders', JSON.stringify(testOrders));

      // Re-create the service to trigger loadFromStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const freshService = TestBed.inject(WorkOrderService);
      expect(freshService.getAll()).toHaveLength(1);
      expect(freshService.getAll()[0].data.name).toBe('Stored Order');
    });

    it('falls back to seed data on invalid JSON', () => {
      localStorage.setItem('work-orders', 'not-json');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const freshService = TestBed.inject(WorkOrderService);
      expect(freshService.getAll().length).toBeGreaterThan(0);
    });
  });
});
