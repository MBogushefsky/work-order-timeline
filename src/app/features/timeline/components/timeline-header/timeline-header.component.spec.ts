import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineHeaderComponent } from './timeline-header.component';
import { TimeScale } from '../../../../core/models/timeline.model';

describe('TimelineHeaderComponent', () => {
  let component: TimelineHeaderComponent;
  let fixture: ComponentFixture<TimelineHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('has default timeScale of "day"', () => {
    expect(component.timeScale).toBe('day');
  });

  it('has 3 scale options', () => {
    expect(component.scaleOptions).toHaveLength(3);
    expect(component.scaleOptions.map(o => o.value)).toEqual(['day', 'week', 'month']);
  });

  describe('timeScaleChange', () => {
    it('emits when timescale changes', () => {
      jest.spyOn(component.timeScaleChange, 'emit');
      component.timeScaleChange.emit('week');
      expect(component.timeScaleChange.emit).toHaveBeenCalledWith('week');
    });
  });

  describe('todayClick', () => {
    it('emits when today button is clicked', () => {
      jest.spyOn(component.todayClick, 'emit');
      component.todayClick.emit();
      expect(component.todayClick.emit).toHaveBeenCalled();
    });
  });
});
