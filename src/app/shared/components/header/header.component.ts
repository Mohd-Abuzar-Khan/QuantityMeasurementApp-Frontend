import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService }  from '@core/services/auth.service';
import { CurrentUser }  from '@core/models/auth.models';

/**
 * HeaderComponent – the top navigation bar shown on all authenticated pages.
 *
 * <h3>Features:</h3>
 * <ul>
 *   <li>Application logo / title linking to the dashboard.</li>
 *   <li>Navigation links: Dashboard, Measurement, History.</li>
 *   <li>Displays the logged-in username.</li>
 *   <li>Logout button that calls {@link AuthService#logout}.</li>
 *   <li>Responsive hamburger menu on small screens.</li>
 * </ul>
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  /** Whether the mobile menu is open */
  menuOpen = false;

  readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService,
    private readonly router:      Router,
  ) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}
