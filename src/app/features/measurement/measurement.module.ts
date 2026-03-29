import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MeasurementComponent } from './components/measurement.component';

const routes: Routes = [
  { path: '', component: MeasurementComponent },
];

/**
 * MeasurementModule – feature module for the quantity measurement UI.
 * Lazy-loaded; requires authentication (enforced by AuthGuard in the root router).
 */
@NgModule({
  declarations: [MeasurementComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [MeasurementComponent],
})
export class MeasurementModule {}
