import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TimeScale, DateRange } from '../../../../core/models/timeline.model';
import { TimelineCalcService } from '../../../../core/services/timeline-calc.service';
import { todayIso } from '../../../../core/utils/date-utils';

@Component({
  selector: 'app-today-indicator',
  standalone: true,
  template: `
    <div class="today-line" [style.left.px]="leftPx">
      <div class="today-dot"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 5;
    }
    .today-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--color-today-line, #EF4444);
    }
    .today-dot {
      position: absolute;
      top: -4px;
      left: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--color-today-line, #EF4444);
    }
  `],
})
export class TodayIndicatorComponent implements OnChanges {
  @Input() visibleRange!: DateRange;
  @Input() timeScale: TimeScale = 'day';

  leftPx = 0;

  constructor(private calcService: TimelineCalcService) {}

  ngOnChanges(): void {
    if (this.visibleRange) {
      this.leftPx = this.calcService.dateToPixelOffset(todayIso(), this.visibleRange, this.timeScale);
    }
  }
}
