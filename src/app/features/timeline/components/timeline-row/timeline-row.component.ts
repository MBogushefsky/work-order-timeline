import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkCenterDocument } from '../../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../../core/models/work-order.model';
import { TimeScale, DateRange, ColumnDef } from '../../../../core/models/timeline.model';
import { TimelineCalcService } from '../../../../core/services/timeline-calc.service';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';

interface BarPosition {
  order: WorkOrderDocument;
  left: number;
  width: number;
}

@Component({
  selector: 'app-timeline-row',
  standalone: true,
  imports: [WorkOrderBarComponent],
  template: `
    <div
      class="row-track"
      [style.width.px]="totalWidth"
      (click)="onTrackClick($event)"
    >
      @for (col of columns; track col.date) {
        <div class="row-cell" [style.width.px]="columnWidth"></div>
      }
      @for (bp of barPositions; track bp.order.docId) {
        <app-work-order-bar
          [workOrder]="bp.order"
          [leftPx]="bp.left"
          [widthPx]="bp.width"
          [closeAllMenus$]="closeAllMenus$"
          (edit)="editOrder.emit($event)"
          (delete)="deleteOrder.emit($event)"
        />
      }
    </div>
  `,
  styleUrl: './timeline-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineRowComponent implements OnChanges {
  @Input() workCenter!: WorkCenterDocument;
  @Input() workOrders: WorkOrderDocument[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() columnWidth = 60;
  @Input() totalWidth = 0;
  @Input() visibleRange!: DateRange;
  @Input() timeScale: TimeScale = 'day';
  @Input() closeAllMenus$!: Subject<void>;
  @Output() emptyClick = new EventEmitter<{ workCenterId: string; date: string }>();
  @Output() editOrder = new EventEmitter<WorkOrderDocument>();
  @Output() deleteOrder = new EventEmitter<WorkOrderDocument>();

  barPositions: BarPosition[] = [];

  constructor(private calcService: TimelineCalcService) {}

  ngOnChanges(): void {
    this.computeBarPositions();
  }

  private computeBarPositions(): void {
    if (!this.visibleRange) return;
    this.barPositions = this.workOrders.map(order => {
      const pos = this.calcService.getBarPosition(
        order.data.startDate, order.data.endDate, this.visibleRange, this.timeScale
      );
      return { order, left: pos.left, width: pos.width };
    });
  }

  onTrackClick(event: MouseEvent): void {
    // Only emit if clicking the empty track area (not a bar)
    const target = event.target as HTMLElement;
    if (target.closest('app-work-order-bar')) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const date = this.calcService.pixelOffsetToDate(offsetX, this.visibleRange, this.timeScale);
    this.emptyClick.emit({ workCenterId: this.workCenter.docId, date });
  }
}
