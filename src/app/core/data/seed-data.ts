import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderDocument } from '../models/work-order.model';
import { addDays, todayIso } from '../utils/date-utils';

const today = todayIso();

export const SEED_WORK_CENTERS: WorkCenterDocument[] = [
  { docId: 'wc-1', docType: 'workCenter', data: { name: 'Extrusion Line A' } },
  { docId: 'wc-2', docType: 'workCenter', data: { name: 'CNC Machine 1' } },
  { docId: 'wc-3', docType: 'workCenter', data: { name: 'Assembly Station' } },
  { docId: 'wc-4', docType: 'workCenter', data: { name: 'Quality Control' } },
  { docId: 'wc-5', docType: 'workCenter', data: { name: 'Packaging Line' } },
];

export const SEED_WORK_ORDERS: WorkOrderDocument[] = [
  // Extrusion Line A — two non-overlapping orders
  {
    docId: 'wo-1',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Extrusion Batch',
      workCenterId: 'wc-1',
      status: 'complete',
      startDate: addDays(today, -10),
      endDate: addDays(today, -4),
    },
  },
  {
    docId: 'wo-2',
    docType: 'workOrder',
    data: {
      name: 'Steel Profile Run',
      workCenterId: 'wc-1',
      status: 'in-progress',
      startDate: addDays(today, -2),
      endDate: addDays(today, 5),
    },
  },

  // CNC Machine 1
  {
    docId: 'wo-3',
    docType: 'workOrder',
    data: {
      name: 'Precision Gear Milling',
      workCenterId: 'wc-2',
      status: 'open',
      startDate: addDays(today, 1),
      endDate: addDays(today, 8),
    },
  },

  // Assembly Station — two non-overlapping orders
  {
    docId: 'wo-4',
    docType: 'workOrder',
    data: {
      name: 'Motor Assembly A',
      workCenterId: 'wc-3',
      status: 'in-progress',
      startDate: addDays(today, -5),
      endDate: addDays(today, 2),
    },
  },
  {
    docId: 'wo-5',
    docType: 'workOrder',
    data: {
      name: 'Motor Assembly B',
      workCenterId: 'wc-3',
      status: 'open',
      startDate: addDays(today, 4),
      endDate: addDays(today, 14),
    },
  },

  // Quality Control
  {
    docId: 'wo-6',
    docType: 'workOrder',
    data: {
      name: 'Batch Inspection #47',
      workCenterId: 'wc-4',
      status: 'blocked',
      startDate: addDays(today, -3),
      endDate: addDays(today, 4),
    },
  },

  // Packaging Line — two non-overlapping orders
  {
    docId: 'wo-7',
    docType: 'workOrder',
    data: {
      name: 'Retail Packaging Run',
      workCenterId: 'wc-5',
      status: 'complete',
      startDate: addDays(today, -12),
      endDate: addDays(today, -6),
    },
  },
  {
    docId: 'wo-8',
    docType: 'workOrder',
    data: {
      name: 'Bulk Shipping Prep',
      workCenterId: 'wc-5',
      status: 'open',
      startDate: addDays(today, 0),
      endDate: addDays(today, 3),
    },
  },
];
