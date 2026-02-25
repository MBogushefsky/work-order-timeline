export type TimeScale = 'day' | 'week' | 'month';

export interface DateRange {
  start: string; // ISO "YYYY-MM-DD"
  end: string;
}

export interface ColumnDef {
  label: string;
  sublabel?: string;
  date: string; // ISO start date of this column
}

export type PanelMode = 'create' | 'edit';
