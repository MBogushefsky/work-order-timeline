import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TimeScale } from '../../../../core/models/timeline.model';

@Component({
  selector: 'app-timeline-header',
  standalone: true,
  imports: [NgSelectModule, FormsModule],
  template: `
    <div class="timeline-header">
      <div class="logo">
        <span class="logo-nao">NAO</span><span class="logo-logic">LOGIC</span>
      </div>
      <h1 class="header-title">Work Orders</h1>
      <div class="timescale-row">
        <span class="timescale-label">Timescale</span>
        <ng-select
          [items]="scaleOptions"
          bindLabel="label"
          bindValue="value"
          [ngModel]="timeScale"
          (ngModelChange)="timeScaleChange.emit($event)"
          [clearable]="false"
          [searchable]="false"
          class="scale-dropdown"
        ></ng-select>
        <button class="today-btn" (click)="todayClick.emit()">Today</button>
      </div>
    </div>
  `,
  styleUrl: './timeline-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineHeaderComponent {
  @Input() timeScale: TimeScale = 'day';
  @Output() timeScaleChange = new EventEmitter<TimeScale>();
  @Output() todayClick = new EventEmitter<void>();

  scaleOptions = [
    { label: 'Day', value: 'day' as TimeScale },
    { label: 'Week', value: 'week' as TimeScale },
    { label: 'Month', value: 'month' as TimeScale },
  ];
}
