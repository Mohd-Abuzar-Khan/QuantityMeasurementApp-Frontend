import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HistoryComponent } from './components/history.component';

const routes: Routes = [
  { path: '', component: HistoryComponent },
];

/**
 * HistoryModule – feature module for the operation history view.
 * Lazy-loaded; requires authentication (enforced by AuthGuard in the root router).
 */
@NgModule({
  declarations: [HistoryComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class HistoryModule {}
