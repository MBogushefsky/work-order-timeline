import { Pipe, PipeTransform } from '@angular/core';
import { WorkOrderStatus } from '../../../core/models/work-order.model';

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: WorkOrderStatus): string {
    switch (value) {
      case 'open':        return 'Open';
      case 'in-progress': return 'In Progress';
      case 'complete':    return 'Complete';
      case 'blocked':     return 'Blocked';
      default:            return value;
    }
  }
}
