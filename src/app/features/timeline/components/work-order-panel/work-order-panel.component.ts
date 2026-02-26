import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output,
  OnChanges, SimpleChanges, ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PanelMode } from '../../../../core/models/timeline.model';
import { WorkOrderDocument, WorkOrderStatus } from '../../../../core/models/work-order.model';
import { WorkCenterDocument } from '../../../../core/models/work-center.model';
import { WorkOrderService } from '../../../../core/services/work-order.service';
import { isoToNgbDate, ngbDateToIso, addDays } from '../../../../core/utils/date-utils';

// @upgrade: Extract form logic into a dedicated FormService for reuse and testing
@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, NgbDatepickerModule],
  templateUrl: './work-order-panel.component.html',
  styleUrl: './work-order-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderPanelComponent implements OnChanges {
  @Input() mode: PanelMode = 'create';
  @Input() isOpen = false;
  @Input() workOrder: WorkOrderDocument | null = null;
  @Input() workCenterId = '';
  @Input() prefilledDate = '';
  @Input() workCenters: WorkCenterDocument[] = [];
  @Output() save = new EventEmitter<{
    data: WorkOrderDocument['data'];
    docId?: string;
  }>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  overlapError = false;

  statusOptions: { label: string; value: WorkOrderStatus }[] = [
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Complete', value: 'complete' },
    { label: 'Blocked', value: 'blocked' },
  ];

  constructor(
    private fb: FormBuilder,
    private workOrderService: WorkOrderService,
  ) {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.overlapError = false;
      if (this.mode === 'edit' && this.workOrder) {
        this.form.patchValue({
          name: this.workOrder.data.name,
          status: this.workOrder.data.status,
          workCenterId: this.workOrder.data.workCenterId,
          startDate: isoToNgbDate(this.workOrder.data.startDate),
          endDate: isoToNgbDate(this.workOrder.data.endDate),
        });
      } else {
        const startIso = this.prefilledDate || new Date().toISOString().slice(0, 10);
        const endIso = addDays(startIso, 7);
        this.form.reset({
          name: '',
          status: 'open',
          workCenterId: this.workCenterId,
          startDate: isoToNgbDate(startIso),
          endDate: isoToNgbDate(endIso),
        });
      }
      this.form.markAsPristine();
      this.form.markAsUntouched();
      setTimeout(() => this.nameInput?.nativeElement?.focus());
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      status: ['open', Validators.required],
      workCenterId: ['', Validators.required],
      startDate: [null as NgbDateStruct | null, Validators.required],
      endDate: [null as NgbDateStruct | null, Validators.required],
    }, { validators: this.endAfterStartValidator });
  }

  /** Cross-field validator: end date must be after start date */
  private endAfterStartValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value as NgbDateStruct | null;
    const end = group.get('endDate')?.value as NgbDateStruct | null;
    if (!start || !end) return null;
    const startIso = ngbDateToIso(start);
    const endIso = ngbDateToIso(end);
    return endIso > startIso ? null : { endBeforeStart: true };
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.overlapError = false;

    if (this.form.invalid) return;

    const val = this.form.value;
    const startIso = ngbDateToIso(val.startDate);
    const endIso = ngbDateToIso(val.endDate);

    // Check overlap
    const excludeId = this.mode === 'edit' ? this.workOrder?.docId : undefined;
    if (this.workOrderService.hasOverlap(val.workCenterId, startIso, endIso, excludeId)) {
      this.overlapError = true;
      return;
    }

    this.save.emit({
      data: {
        name: val.name,
        status: val.status,
        workCenterId: val.workCenterId,
        startDate: startIso,
        endDate: endIso,
      },
      docId: this.workOrder?.docId,
    });
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close.emit();
    }
  }

  getWorkCenterName(id: string): string {
    return this.workCenters.find(wc => wc.docId === id)?.data.name ?? '';
  }
}
