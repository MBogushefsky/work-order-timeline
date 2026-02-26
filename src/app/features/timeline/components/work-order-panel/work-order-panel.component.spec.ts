import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkOrderPanelComponent } from './work-order-panel.component';
import { WorkOrderService } from '../../../../core/services/work-order.service';
import { WorkOrderDocument } from '../../../../core/models/work-order.model';
import { WorkCenterDocument } from '../../../../core/models/work-center.model';
import { SimpleChange } from '@angular/core';

const mockWorkCenters: WorkCenterDocument[] = [
  { docId: 'wc-1', docType: 'workCenter', data: { name: 'Center A' } },
  { docId: 'wc-2', docType: 'workCenter', data: { name: 'Center B' } },
];

const mockWorkOrder: WorkOrderDocument = {
  docId: 'wo-1',
  docType: 'workOrder',
  data: {
    name: 'Existing Order',
    workCenterId: 'wc-1',
    status: 'open',
    startDate: '2025-06-01',
    endDate: '2025-06-10',
  },
};

describe('WorkOrderPanelComponent', () => {
  let component: WorkOrderPanelComponent;
  let fixture: ComponentFixture<WorkOrderPanelComponent>;
  let workOrderService: WorkOrderService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [WorkOrderPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderPanelComponent);
    component = fixture.componentInstance;
    workOrderService = TestBed.inject(WorkOrderService);
    component.workCenters = mockWorkCenters;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('form is invalid when empty', () => {
      component.form.reset();
      expect(component.form.invalid).toBe(true);
    });

    it('name field is required', () => {
      component.form.patchValue({ name: '' });
      expect(component.form.get('name')!.hasError('required')).toBe(true);
    });

    it('form is valid with all required fields', () => {
      component.form.patchValue({
        name: 'Test Order',
        status: 'open',
        workCenterId: 'wc-1',
        startDate: { year: 2025, month: 6, day: 1 },
        endDate: { year: 2025, month: 6, day: 10 },
      });
      expect(component.form.valid).toBe(true);
    });

    it('validates end date must be after start date', () => {
      component.form.patchValue({
        name: 'Test',
        status: 'open',
        workCenterId: 'wc-1',
        startDate: { year: 2025, month: 6, day: 10 },
        endDate: { year: 2025, month: 6, day: 1 },
      });
      expect(component.form.hasError('endBeforeStart')).toBe(true);
    });
  });

  describe('create mode', () => {
    it('resets form when panel opens in create mode', () => {
      component.mode = 'create';
      component.isOpen = true;
      component.workCenterId = 'wc-1';
      component.ngOnChanges({
        isOpen: new SimpleChange(false, true, false),
      });
      expect(component.form.get('workCenterId')!.value).toBe('wc-1');
      expect(component.form.get('name')!.value).toBe('');
      expect(component.overlapError).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('populates form with existing work order data', () => {
      component.mode = 'edit';
      component.isOpen = true;
      component.workOrder = mockWorkOrder;
      component.ngOnChanges({
        isOpen: new SimpleChange(false, true, false),
      });
      expect(component.form.get('name')!.value).toBe('Existing Order');
      expect(component.form.get('status')!.value).toBe('open');
      expect(component.form.get('workCenterId')!.value).toBe('wc-1');
    });
  });

  describe('onSubmit', () => {
    it('does not emit save when form is invalid', () => {
      jest.spyOn(component.save, 'emit');
      component.form.reset();
      component.onSubmit();
      expect(component.save.emit).not.toHaveBeenCalled();
    });

    it('emits save event with valid form data', () => {
      jest.spyOn(component.save, 'emit');
      jest.spyOn(workOrderService, 'hasOverlap').mockReturnValue(false);
      component.form.patchValue({
        name: 'New Order',
        status: 'open',
        workCenterId: 'wc-2',
        startDate: { year: 2025, month: 7, day: 1 },
        endDate: { year: 2025, month: 7, day: 10 },
      });
      component.onSubmit();
      expect(component.save.emit).toHaveBeenCalledWith({
        data: {
          name: 'New Order',
          status: 'open',
          workCenterId: 'wc-2',
          startDate: '2025-07-01',
          endDate: '2025-07-10',
        },
        docId: undefined,
      });
    });

    it('sets overlapError when overlap detected', () => {
      jest.spyOn(workOrderService, 'hasOverlap').mockReturnValue(true);
      jest.spyOn(component.save, 'emit');
      component.form.patchValue({
        name: 'Overlap Order',
        status: 'open',
        workCenterId: 'wc-1',
        startDate: { year: 2025, month: 6, day: 1 },
        endDate: { year: 2025, month: 6, day: 10 },
      });
      component.onSubmit();
      expect(component.overlapError).toBe(true);
      expect(component.save.emit).not.toHaveBeenCalled();
    });
  });

  describe('onClose', () => {
    it('emits close event', () => {
      jest.spyOn(component.close, 'emit');
      component.onClose();
      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('onEscape', () => {
    it('emits close when panel is open', () => {
      jest.spyOn(component.close, 'emit');
      component.isOpen = true;
      component.onEscape();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('does not emit close when panel is closed', () => {
      jest.spyOn(component.close, 'emit');
      component.isOpen = false;
      component.onEscape();
      expect(component.close.emit).not.toHaveBeenCalled();
    });
  });

  describe('getWorkCenterName', () => {
    it('returns name for known work center', () => {
      expect(component.getWorkCenterName('wc-1')).toBe('Center A');
    });

    it('returns empty string for unknown work center', () => {
      expect(component.getWorkCenterName('wc-999')).toBe('');
    });
  });
});
