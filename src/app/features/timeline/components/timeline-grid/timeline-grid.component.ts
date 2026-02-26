import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output,
  OnChanges, ViewChild, ElementRef, AfterViewInit, SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';
import { WorkCenterDocument } from '../../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../../core/models/work-order.model';
import { TimeScale, DateRange, ColumnDef } from '../../../../core/models/timeline.model';
import { TimelineCalcService } from '../../../../core/services/timeline-calc.service';
import { TimelineRowComponent } from '../timeline-row/timeline-row.component';
import { TodayIndicatorComponent } from '../today-indicator/today-indicator.component';
import { todayIso } from '../../../../core/utils/date-utils';

// @upgrade: Implement virtual scrolling (CDK) for large datasets with 100+ work orders
@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [TimelineRowComponent, TodayIndicatorComponent],
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

  /** Emits on document click so child bars can close their menus */
  closeAllMenus$ = new Subject<void>();

  visibleRange!: DateRange;
  columns: ColumnDef[] = [];
  columnWidth = 60;
  totalWidth = 0;

  /** Pre-computed map: workCenterId → WorkOrderDocument[] (Issue 4) */
  ordersByCenter = new Map<string, WorkOrderDocument[]>();

  private hasScrolledToToday = false;
  private isExpanding = false;
  private scrollRafPending = false;

  constructor(private calcService: TimelineCalcService, private cdr: ChangeDetectorRef) {}

  /** Single delegated click-outside listener (Issue 2+3) */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus$.next();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workOrders']) {
      this.rebuildOrdersByCenter();
    }
    this.recompute();
  }

  ngAfterViewInit(): void {
    this.scrollToToday();
  }

  private rebuildOrdersByCenter(): void {
    this.ordersByCenter.clear();
    for (const wo of this.workOrders) {
      const id = wo.data.workCenterId;
      const list = this.ordersByCenter.get(id);
      if (list) {
        list.push(wo);
      } else {
        this.ordersByCenter.set(id, [wo]);
      }
    }
  }

  private recompute(): void {
    this.columnWidth = this.calcService.getColumnWidth(this.timeScale);
    this.visibleRange = this.calcService.getVisibleRange(this.timeScale);
    this.columns = this.calcService.generateColumns(this.visibleRange, this.timeScale);
    this.totalWidth = this.columns.length * this.columnWidth;
    this.isExpanding = false;
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

  /** Sync vertical scroll and detect edges for infinite horizontal scroll (Issue 5: rAF throttle) */
  onRightScroll(): void {
    if (this.leftPanel && this.scrollContainer) {
      this.leftPanel.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollTop;
    }

    if (this.scrollRafPending || this.isExpanding || !this.scrollContainer) return;
    this.scrollRafPending = true;

    requestAnimationFrame(() => {
      this.scrollRafPending = false;
      this.handleScrollExpansion();
    });
  }

  private handleScrollExpansion(): void {
    if (this.isExpanding || !this.scrollContainer) return;

    const EDGE_THRESHOLD = 200;
    const el = this.scrollContainer.nativeElement;
    const maxColumns = this.calcService.getMaxColumns(this.timeScale);

    // Expand left (prepend columns)
    if (el.scrollLeft < EDGE_THRESHOLD && this.columns.length < maxColumns) {
      this.isExpanding = true;
      const oldScrollLeft = el.scrollLeft;
      const oldScrollWidth = el.scrollWidth;

      this.visibleRange = this.calcService.expandRange(this.visibleRange, this.timeScale, 'left');
      this.columns = this.calcService.generateColumns(this.visibleRange, this.timeScale);
      this.totalWidth = this.columns.length * this.columnWidth;
      this.cdr.detectChanges();

      const addedWidth = el.scrollWidth - oldScrollWidth;
      el.scrollLeft = oldScrollLeft + addedWidth;

      requestAnimationFrame(() => { this.isExpanding = false; });
      return;
    }

    // Expand right (append columns)
    if (el.scrollLeft + el.clientWidth > el.scrollWidth - EDGE_THRESHOLD && this.columns.length < maxColumns) {
      this.isExpanding = true;

      this.visibleRange = this.calcService.expandRange(this.visibleRange, this.timeScale, 'right');
      this.columns = this.calcService.generateColumns(this.visibleRange, this.timeScale);
      this.totalWidth = this.columns.length * this.columnWidth;
      this.cdr.markForCheck();

      requestAnimationFrame(() => { this.isExpanding = false; });
    }
  }

  getOrdersForCenter(workCenterId: string): WorkOrderDocument[] {
    return this.ordersByCenter.get(workCenterId) ?? [];
  }

  get currentPeriodLabel(): string {
    switch (this.timeScale) {
      case 'day': return 'Today';
      case 'week': return 'Current week';
      case 'month': return 'Current month';
    }
  }
}
