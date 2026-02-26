import { StatusLabelPipe } from './status-label.pipe';
import { WorkOrderStatus } from '../../../core/models/work-order.model';

describe('StatusLabelPipe', () => {
  let pipe: StatusLabelPipe;

  beforeEach(() => {
    pipe = new StatusLabelPipe();
  });

  it('transforms "open" to "Open"', () => {
    expect(pipe.transform('open')).toBe('Open');
  });

  it('transforms "in-progress" to "In Progress"', () => {
    expect(pipe.transform('in-progress')).toBe('In Progress');
  });

  it('transforms "complete" to "Complete"', () => {
    expect(pipe.transform('complete')).toBe('Complete');
  });

  it('transforms "blocked" to "Blocked"', () => {
    expect(pipe.transform('blocked')).toBe('Blocked');
  });

  it('returns the value unchanged for unknown status', () => {
    expect(pipe.transform('unknown' as WorkOrderStatus)).toBe('unknown');
  });
});
