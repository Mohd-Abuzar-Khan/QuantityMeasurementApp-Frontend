import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@core/guards/auth.guard';
import { OAuth2CallbackComponent } from './features/auth/components/oauth2-callback/oauth2-callback.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'oauth2/callback',
    component: OAuth2CallbackComponent,
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'measurement',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/measurement/measurement.module').then(m => m.MeasurementModule),
  },
  {
    path: 'history',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/history/history.module').then(m => m.HistoryModule),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
