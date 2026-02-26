import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { WorkOrderDocument } from '../../../../core/models/work-order.model';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [StatusLabelPipe, NgbTooltipModule],
  template: `
    <div
      class="bar"
      role="button"
      [class]="'bar status-' + workOrder.data.status + (menuOpen ? ' menu-open' : '')"
      [style.left.px]="leftPx"
      [style.width.px]="widthPx"
      [ngbTooltip]="tooltipText" container="body" placement="top"
      (click)="$event.stopPropagation()"
    >
      <span class="bar-name">{{ workOrder.data.name }}</span>
      <span class="bar-badge" [class]="'badge-' + workOrder.data.status">
        {{ workOrder.data.status | statusLabel }}
      </span>
      <button class="bar-menu-btn" aria-label="Actions menu" (click)="toggleMenu($event)">
        <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
          <circle cx="2" cy="2" r="1.5"/>
          <circle cx="8" cy="2" r="1.5"/>
          <circle cx="14" cy="2" r="1.5"/>
        </svg>
      </button>
      @if (menuOpen) {
        <div class="bar-menu-dropdown" role="menu">
          <button class="menu-item" role="menuitem" (click)="onEdit($event)">Edit</button>
          <button class="menu-item menu-item--danger" role="menuitem" (click)="onDelete($event)">Delete</button>
        </div>
      }
    </div>
  `,
  styleUrl: './work-order-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderBarComponent implements OnInit, OnDestroy {
  @Input() workOrder!: WorkOrderDocument;
  @Input() leftPx = 0;
  @Input() widthPx = 100;
  @Input() closeAllMenus$!: Observable<void>;
  @Output() edit = new EventEmitter<WorkOrderDocument>();
  @Output() delete = new EventEmitter<WorkOrderDocument>();

  menuOpen = false;
  private closeMenuSub?: Subscription;

  get tooltipText(): string {
    const d = this.workOrder.data;
    return `${d.name}\nStatus: ${d.status.charAt(0).toUpperCase() + d.status.slice(1).replace('-', ' ')}\n${d.startDate} → ${d.endDate}`;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.closeAllMenus$) {
      this.closeMenuSub = this.closeAllMenus$.subscribe(() => {
        if (this.menuOpen) {
          this.menuOpen = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.closeMenuSub?.unsubscribe();
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.menuOpen = !this.menuOpen;
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = false;
    this.edit.emit(this.workOrder);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = false;
    this.delete.emit(this.workOrder);
  }
}
