import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/timeline/timeline.routes').then(m => m.TIMELINE_ROUTES),
  },
];
