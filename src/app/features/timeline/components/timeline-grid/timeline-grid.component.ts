import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges,
  ViewChild, ElementRef, AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument } from '../../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../../core/models/work-order.model';
import { TimeScale, DateRange, ColumnDef } from '../../../../core/models/timeline.model';
import { TimelineCalcService } from '../../../../core/services/timeline-calc.service';
import { TimelineRowComponent } from '../timeline-row/timeline-row.component';
import { TodayIndicatorComponent } from '../today-indicator/today-indicator.component';
import { todayIso, dayOfWeekAbbr } from '../../../../core/utils/date-utils';

// @upgrade: Implement virtual scrolling (CDK) for large datasets with 100+ work orders
@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [CommonModule, TimelineRowComponent, TodayIndicatorComponent],
  templateUrl: './timeline-grid.component.html',
  styleUrl: './timeline-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineGridComponent implements OnChanges, AfterViewInit {
  @Input() workCenters: WorkCenterDocument[] = [];
  @Input() workOrders: WorkOrderDocument[] = [];
  @Input() timeScale: TimeScale = 'day';
  @Output() emptyAreaClick = new EventEmitter<{ workCenterId: string; date: string }>();
  @Output() editWorkOrder = new EventEmitter<WorkOrderDocument>();
  @Output() deleteWorkOrder = new EventEmitter<WorkOrderDocument>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('leftPanel') leftPanel!: ElementRef<HTMLDivElement>;

  visibleRange!: DateRange;
  columns: ColumnDef[] = [];
  columnWidth = 60;
  totalWidth = 0;
  private hasScrolledToToday = false;

  constructor(private calcService: TimelineCalcService) {}

  ngOnChanges(): void {
    this.recompute();
  }

  ngAfterViewInit(): void {
    this.scrollToToday();
  }

  private recompute(): void {
    this.columnWidth = this.calcService.getColumnWidth(this.timeScale);
    this.visibleRange = this.calcService.getVisibleRange(this.timeScale);
    this.columns = this.calcService.generateColumns(this.visibleRange, this.timeScale);
    this.totalWidth = this.columns.length * this.columnWidth;
  }

  scrollToToday(): void {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    const todayOffset = this.calcService.dateToPixelOffset(todayIso(), this.visibleRange, this.timeScale);
    // Center today in the viewport
    const scrollLeft = todayOffset - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, scrollLeft);
    this.hasScrolledToToday = true;
  }

  /** Sync vertical scroll between left panel and right scroll container */
  onRightScroll(): void {
    if (this.leftPanel && this.scrollContainer) {
      this.leftPanel.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollTop;
    }
  }

  getOrdersForCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders.filter(wo => wo.data.workCenterId === workCenterId);
  }

  isToday(dateStr: string): boolean {
    return dateStr === todayIso();
  }

  get currentPeriodLabel(): string {
    switch (this.timeScale) {
      case 'day': return 'Today';
      case 'week': return 'Current week';
      case 'month': return 'Current month';
    }
  }

  /** Check if a column date falls in the current period (month for month view, week for week, today for day) */
  isCurrentPeriod(dateStr: string): boolean {
    const today = todayIso();
    switch (this.timeScale) {
      case 'day':
        return dateStr === today;
      case 'week': {
        const colStart = new Date(dateStr + 'T00:00:00');
        const colEnd = new Date(colStart);
        colEnd.setDate(colEnd.getDate() + 6);
        const t = new Date(today + 'T00:00:00');
        return t >= colStart && t <= colEnd;
      }
      case 'month': {
        return dateStr.slice(0, 7) === today.slice(0, 7);
      }
    }
  }

  isWeekend(dateStr: string): boolean {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDay() === 0 || d.getDay() === 6;
  }
}
