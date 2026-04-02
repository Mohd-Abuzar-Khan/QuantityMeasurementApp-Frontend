import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { AuthService } from '@core/services/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private readonly authService: AuthService,
    private readonly router:      Router,
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    state:  RouterStateSnapshot,
  ): boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    _childRoute: ActivatedRouteSnapshot,
    state:       RouterStateSnapshot,
  ): boolean {
    return this.checkAuth(state.url);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private checkAuth(returnUrl: string): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    }

    // OAuth2 flow safety: if JWT is still in the URL, consume it before redirecting.
    if (this.authService.tryHydrateSessionFromUrl(returnUrl)) {
      return true;
    }

    // Redirect to login, carrying the original destination for post-login redirect
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl },
    });
    return false;
  }
}
