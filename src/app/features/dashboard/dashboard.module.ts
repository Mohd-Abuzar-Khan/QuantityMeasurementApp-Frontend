import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard.component';
import { MeasurementModule } from '../measurement/measurement.module';

const routes: Routes = [
  { path: '', component: DashboardComponent },
];

/**
 * DashboardModule – post-login home with embedded measurement UI.
 * Lazy-loaded; requires authentication (enforced by AuthGuard in the root router).
 */
@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MeasurementModule,
    RouterModule.forChild(routes),
  ],
})
export class DashboardModule {}
