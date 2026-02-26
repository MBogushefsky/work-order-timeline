import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderBarComponent } from './work-order-bar.component';
import { WorkOrderDocument } from '../../../../core/models/work-order.model';

const mockWorkOrder: WorkOrderDocument = {
  docId: 'wo-test-1',
  docType: 'workOrder',
  data: {
    name: 'Test Order',
    workCenterId: 'wc-1',
    status: 'in-progress',
    startDate: '2025-06-01',
    endDate: '2025-06-10',
  },
};

describe('WorkOrderBarComponent', () => {
  let component: WorkOrderBarComponent;
  let fixture: ComponentFixture<WorkOrderBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderBarComponent);
    component = fixture.componentInstance;
    component.workOrder = mockWorkOrder;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('tooltipText', () => {
    it('includes work order name', () => {
      expect(component.tooltipText).toContain('Test Order');
    });

    it('includes status with capitalized first letter', () => {
      expect(component.tooltipText).toContain('Status: In progress');
    });

    it('includes date range', () => {
      expect(component.tooltipText).toContain('2025-06-01');
      expect(component.tooltipText).toContain('2025-06-10');
    });
  });

  describe('toggleMenu', () => {
    it('toggles menuOpen state', () => {
      expect(component.menuOpen).toBe(false);
      const event = new MouseEvent('click');
      jest.spyOn(event, 'stopPropagation');
      jest.spyOn(event, 'preventDefault');
      component.toggleMenu(event);
      expect(component.menuOpen).toBe(true);
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('toggles off when called again', () => {
      component.menuOpen = true;
      component.toggleMenu(new MouseEvent('click'));
      expect(component.menuOpen).toBe(false);
    });
  });

  describe('onEdit', () => {
    it('emits edit event with work order and closes menu', () => {
      jest.spyOn(component.edit, 'emit');
      component.menuOpen = true;
      component.onEdit(new MouseEvent('click'));
      expect(component.menuOpen).toBe(false);
      expect(component.edit.emit).toHaveBeenCalledWith(mockWorkOrder);
    });
  });

  describe('onDelete', () => {
    it('emits delete event with work order and closes menu', () => {
      jest.spyOn(component.delete, 'emit');
      component.menuOpen = true;
      component.onDelete(new MouseEvent('click'));
      expect(component.menuOpen).toBe(false);
      expect(component.delete.emit).toHaveBeenCalledWith(mockWorkOrder);
    });
  });

  describe('onDocumentClick', () => {
    it('closes menu when clicking outside', () => {
      component.menuOpen = true;
      const outsideEvent = new MouseEvent('click');
      // Simulate click outside the element
      component.onDocumentClick(outsideEvent);
      expect(component.menuOpen).toBe(false);
    });

    it('does nothing when menu is already closed', () => {
      component.menuOpen = false;
      component.onDocumentClick(new MouseEvent('click'));
      expect(component.menuOpen).toBe(false);
    });
  });
});
