import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../core/models/work-order.model';
import { TimeScale, PanelMode } from '../../../core/models/timeline.model';
import { WorkCenterService } from '../../../core/services/work-center.service';
import { WorkOrderService } from '../../../core/services/work-order.service';
import { TimelineHeaderComponent } from '../components/timeline-header/timeline-header.component';
import { TimelineGridComponent } from '../components/timeline-grid/timeline-grid.component';
import { WorkOrderPanelComponent } from '../components/work-order-panel/work-order-panel.component';

@Component({
  selector: 'app-timeline-page',
  standalone: true,
  imports: [
    CommonModule,
    TimelineHeaderComponent,
    TimelineGridComponent,
    WorkOrderPanelComponent,
  ],
  templateUrl: './timeline-page.component.html',
  styleUrl: './timeline-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelinePageComponent implements OnInit, OnDestroy {
  @ViewChild(TimelineGridComponent) grid!: TimelineGridComponent;

  workCenters: WorkCenterDocument[] = [];
  workOrders: WorkOrderDocument[] = [];
  timeScale: TimeScale = 'day';

  // Panel state
  panelOpen = false;
  panelMode: PanelMode = 'create';
  selectedWorkOrder: WorkOrderDocument | null = null;
  selectedWorkCenterId = '';
  clickedDate = '';

  private sub!: Subscription;

  constructor(
    private workCenterService: WorkCenterService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.workCenters = this.workCenterService.getAll();
    this.sub = this.workOrderService.workOrders$.subscribe(orders => {
      this.workOrders = orders;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onTimeScaleChange(scale: TimeScale): void {
    this.timeScale = scale;
    // Re-center on today after timescale switch
    setTimeout(() => this.grid?.scrollToToday(), 0);
  }

  onTodayClick(): void {
    this.grid?.scrollToToday();
  }

  onEmptyAreaClick(event: { workCenterId: string; date: string }): void {
    this.panelMode = 'create';
    this.selectedWorkOrder = null;
    this.selectedWorkCenterId = event.workCenterId;
    this.clickedDate = event.date;
    // Delay panel open so click-outside handler doesn't immediately close it
    setTimeout(() => { this.panelOpen = true; this.cdr.markForCheck(); }, 0);
  }

  onEditWorkOrder(order: WorkOrderDocument): void {
    this.panelMode = 'edit';
    this.selectedWorkOrder = order;
    this.selectedWorkCenterId = order.data.workCenterId;
    this.clickedDate = order.data.startDate;
    setTimeout(() => { this.panelOpen = true; this.cdr.markForCheck(); }, 0);
  }

  onDeleteWorkOrder(order: WorkOrderDocument): void {
    this.workOrderService.delete(order.docId);
  }

  onPanelSave(event: { data: WorkOrderDocument['data']; docId?: string }): void {
    if (this.panelMode === 'edit' && event.docId) {
      this.workOrderService.update(event.docId, event.data);
    } else {
      this.workOrderService.create(event.data);
    }
    this.panelOpen = false;
  }

  onPanelClose(): void {
    this.panelOpen = false;
  }
}
