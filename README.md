# Work Order Schedule Timeline

An interactive timeline component for a manufacturing ERP system, built with Angular 19. Allows users to visualize, create, and edit work orders across multiple work centers with Day/Week/Month zoom levels.

## Quick Start

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## Features

- **Timeline Grid** — Horizontally scrollable grid with fixed left panel for work center names
- **Day/Week/Month Zoom** — Switch between timescales via dropdown; grid recomputes columns and bar positions
- **Work Order Bars** — Color-coded by status (Open, In Progress, Complete, Blocked) with name and badge
- **Create Panel** — Click empty timeline area to create a new work order with pre-filled start date and work center
- **Edit Panel** — Three-dot menu on each bar opens Edit/Delete options; Edit pre-populates the form
- **Delete** — Remove work orders via the three-dot menu
- **Overlap Detection** — Prevents saving work orders that overlap on the same work center
- **Today Indicator** — Red vertical line marking the current date
- **Today Button** — Quick-jump to center the viewport on today
- **Form Validation** — Required fields, end-date-after-start cross-field validation
- **localStorage Persistence** — Work orders survive page refresh
- **Keyboard Support** — Escape closes panel
- **Circular Std Font** — Loaded via CDN as specified in the design reference

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| Angular | 19 | Framework (standalone components) |
| `@ng-select/ng-select` | 14 | Status & work center dropdowns |
| `@ng-bootstrap/ng-bootstrap` | 18 | ngb-datepicker for date fields |
| Bootstrap | 5 | CSS reset (peer dep for ng-bootstrap) |
| TypeScript | Strict mode | Type safety |
| SCSS | — | All styling with CSS variables |

## Project Structure

```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces (WorkCenter, WorkOrder, Timeline)
│   ├── services/        # WorkCenterService, WorkOrderService, TimelineCalcService
│   ├── data/            # Seed data (5 work centers, 8 work orders)
│   └── utils/           # Date utilities, ID generator
└── features/
    └── timeline/
        ├── timeline-page/       # Smart container (coordinates all state)
        ├── components/
        │   ├── timeline-header/ # Title + timescale dropdown + Today button
        │   ├── timeline-grid/   # Fixed left panel + scrollable right grid
        │   ├── timeline-row/    # Single work center row with bar positioning
        │   ├── work-order-bar/  # Status-colored bar with 3-dot menu
        │   ├── work-order-panel/# Slide-in create/edit form
        │   └── today-indicator/ # Vertical red line at today's date
        └── pipes/
            └── status-label.pipe.ts
```

## Architecture Decisions

- **Standalone components** — No NgModules; components declare their own imports
- **Smart/dumb component pattern** — `TimelinePageComponent` holds all state and coordinates children via `@Input`/`@Output`
- **BehaviorSubject service** — `WorkOrderService` uses RxJS BehaviorSubject for reactive state management
- **Date-to-pixel math** — `TimelineCalcService` handles all coordinate calculations with different formulas per timescale
- **Lazy-loaded feature** — Timeline module loads on demand via route

## Sample Data

Includes 5 work centers and 8 work orders with dates relative to today, ensuring they're always visible:
- **Extrusion Line A** — 2 orders (Complete + In Progress)
- **CNC Machine 1** — 1 order (Open)
- **Assembly Station** — 2 orders (In Progress + Open)
- **Quality Control** — 1 order (Blocked)
- **Packaging Line** — 2 orders (Complete + Open)

## Status Colors

| Status | Background | Border |
|--------|-----------|--------|
| Open | `#E8F0FE` | `#4A90D9` |
| In Progress | `#EDE9FE` | `#7C3AED` |
| Complete | `#D1FAE5` | `#10B981` |
| Blocked | `#FEF3C7` | `#F59E0B` |
