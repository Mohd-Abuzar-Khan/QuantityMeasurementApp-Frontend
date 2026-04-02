import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';


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
