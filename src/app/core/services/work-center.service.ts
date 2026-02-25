import { Injectable } from '@angular/core';
import { WorkCenterDocument } from '../models/work-center.model';
import { SEED_WORK_CENTERS } from '../data/seed-data';

@Injectable({ providedIn: 'root' })
export class WorkCenterService {
  private workCenters: WorkCenterDocument[] = SEED_WORK_CENTERS;

  getAll(): WorkCenterDocument[] {
    return this.workCenters;
  }

  getById(docId: string): WorkCenterDocument | undefined {
    return this.workCenters.find(wc => wc.docId === docId);
  }
}
