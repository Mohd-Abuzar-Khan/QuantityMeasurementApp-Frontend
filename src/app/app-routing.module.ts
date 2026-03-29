import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@core/guards/auth.guard';
import { OAuth2CallbackComponent } from './features/auth/components/oauth2-callback/oauth2-callback.component';

/**
 * Root routing configuration.
 *
 * All feature modules are lazy-loaded to reduce the initial bundle size.
 * Protected routes are wrapped with {@link AuthGuard}.
 *
 * Route hierarchy:
 * ├── /auth          → AuthModule        (public: login, signup, oauth2 callback)
 * ├── /dashboard     → DashboardModule   (protected)
 * ├── /measurement   → MeasurementModule (protected)
 * ├── /history       → HistoryModule     (protected)
 * └── **             → redirect to /dashboard
 */
const routes: Routes = [
  // ── Default redirect ───────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // ── Public: Authentication ─────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule),
  },

  // ── OAuth2 redirect target (must match app.oauth2.redirect-uri on the server) ─
  {
    path: 'oauth2/callback',
    component: OAuth2CallbackComponent,
  },

  // ── Protected: Dashboard ───────────────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
  },

  // ── Protected: Measurement ─────────────────────────────────────────────────
  {
    path: 'measurement',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/measurement/measurement.module').then(m => m.MeasurementModule),
  },

  // ── Protected: History ────────────────────────────────────────────────────
  {
    path: 'history',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/history/history.module').then(m => m.HistoryModule),
  },

  // ── Fallback: redirect unknown paths ─────────────────────────────────────
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Scroll to top on every navigation
    scrollPositionRestoration: 'top',
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
