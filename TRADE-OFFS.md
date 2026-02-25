# Trade-offs & Design Decisions

## State Management: BehaviorSubject vs NgRx vs Signals
**Chose:** BehaviorSubject in WorkOrderService
**Why:** Simple reactive state for a single-entity store. NgRx adds boilerplate without benefit at this scale. Angular Signals are newer but BehaviorSubject integrates seamlessly with existing RxJS patterns.
**@upgrade:** Migrate to Signals when Angular stabilizes signal-based component APIs.

## Date Calculations: Native Date vs date-fns
**Chose:** Native JavaScript Date with custom utility functions
**Why:** Zero additional bundle size. The required calculations (add days, difference in days, format) are straightforward. date-fns would add ~15KB for marginal benefit.
**@upgrade:** Switch to date-fns if calculations grow more complex (timezone handling, locale formatting).

## Scroll Strategy: Fixed Range vs Infinite Scroll
**Chose:** Fixed visible range centered on today with buffer
**Why:** Simpler implementation, predictable performance. Buffer sizes (±14 days, ±8 weeks, ±6 months) cover typical planning horizons.
**@upgrade:** Implement infinite scroll with dynamic column prepend/append and scroll position adjustment.

## Component Architecture: Standalone vs NgModule
**Chose:** Standalone components with lazy-loaded feature routes
**Why:** Angular 17+ best practice. Simpler dependency management, tree-shakeable, no module boilerplate.

## Panel Click-Outside: @HostListener vs Overlay
**Chose:** Overlay div with click handler + Escape key listener
**Why:** More reliable than document click detection which conflicts with datepicker/dropdown popups that render outside the component DOM tree.

## localStorage Persistence
**Chose:** Simple JSON serialization on every mutation
**Why:** Minimal code, immediate persistence. No need for IndexedDB complexity at this data volume.
**@upgrade:** Add versioning/migration for schema changes. Consider IndexedDB for large datasets.
