import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkOrderDocument } from '../models/work-order.model';
import { SEED_WORK_ORDERS } from '../data/seed-data';
import { generateId } from '../utils/id-generator';

const STORAGE_KEY = 'work-orders';

@Injectable({ providedIn: 'root' })
// @upgrade: Replace BehaviorSubject with Angular Signals for fine-grained reactivity
export class WorkOrderService {
  private workOrdersSubject = new BehaviorSubject<WorkOrderDocument[]>(this.loadFromStorage());
  workOrders$ = this.workOrdersSubject.asObservable();

  getAll(): WorkOrderDocument[] {
    return this.workOrdersSubject.getValue();
  }

  getByWorkCenter(workCenterId: string): WorkOrderDocument[] {
    return this.getAll().filter(wo => wo.data.workCenterId === workCenterId);
  }

  create(data: WorkOrderDocument['data']): void {
    const order: WorkOrderDocument = {
      docId: generateId(),
      docType: 'workOrder',
      data: { ...data },
    };
    const updated = [...this.getAll(), order];
    this.workOrdersSubject.next(updated);
    this.saveToStorage(updated);
  }

  update(docId: string, data: Partial<WorkOrderDocument['data']>): void {
    const updated = this.getAll().map(wo =>
      wo.docId === docId ? { ...wo, data: { ...wo.data, ...data } } : wo
    );
    this.workOrdersSubject.next(updated);
    this.saveToStorage(updated);
  }

  delete(docId: string): void {
    const updated = this.getAll().filter(wo => wo.docId !== docId);
    this.workOrdersSubject.next(updated);
    this.saveToStorage(updated);
  }

  /**
   * Check if a work order would overlap with existing orders on the same work center.
   * Overlap formula: startA < endB && startB < endA
   */
  hasOverlap(workCenterId: string, startDate: string, endDate: string, excludeDocId?: string): boolean {
    return this.getByWorkCenter(workCenterId)
      .filter(wo => wo.docId !== excludeDocId)
      .some(wo => startDate < wo.data.endDate && wo.data.startDate < endDate);
  }

  private loadFromStorage(): WorkOrderDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WorkOrderDocument[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fall through to seed data
    }
    return [...SEED_WORK_ORDERS];
  }

  private saveToStorage(orders: WorkOrderDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }
}
