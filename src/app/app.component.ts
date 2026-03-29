import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';

/**
 * AppComponent – root component / shell of the application.
 *
 * The template provides the top-level layout:
 *   ┌──────────────────────────────────────┐
 *   │  <app-header>  (shown when logged in) │
 *   ├──────────────────────────────────────┤
 *   │  <router-outlet>  (feature pages)     │
 *   ├──────────────────────────────────────┤
 *   │  <app-notification>  (global toasts)  │
 *   └──────────────────────────────────────┘
 *
 * The header is conditionally rendered via the {@code isAuthenticated$} stream
 * so it is hidden on the login/register pages.
 */
@Component({
  selector: 'app-root',
  template: `
    <app-header *ngIf="isAuthenticated$ | async"></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-notification></app-notification>
  `,
  styles: [`
    .main-content {
      min-height: 100vh;
    }
  `],
})
export class AppComponent {

  readonly isAuthenticated$: Observable<boolean>;

  constructor(private readonly authService: AuthService) {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => !!user),
    );
  }
}
