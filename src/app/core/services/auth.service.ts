import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '@environments/environment';
import {
  AuthResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from '@core/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly AUTH_URL    = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY   = 'qma_access_token';
  private readonly USER_KEY    = 'qma_current_user';

  /** Emits the currently logged-in user, or null when unauthenticated. */
  private readonly currentUserSubject =
    new BehaviorSubject<CurrentUser | null>(this.loadUserFromStorage());

  /** Public observable stream for components and guards to subscribe to. */
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http:   HttpClient,
    private readonly router: Router,
  ) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Returns a snapshot of the currently authenticated user.
   * Prefer subscribing to {@link currentUser$} in reactive contexts.
   */
  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  /** Whether a user is currently authenticated (token + stored user must agree). */
  get isAuthenticated(): boolean {
    return this.token !== null && this.currentUser !== null;
  }

  /** Returns the raw JWT string, or null if not authenticated. */
  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Authenticates with username + password.
   *
   * On success:
   *  - Persists the token and user to localStorage.
   *  - Updates the {@link currentUser$} stream.
   *  - Navigates to the dashboard.
   *
   * @param request Login credentials.
   * @returns Observable that emits the {@link AuthResponse}.
   */
  /**
   * @param redirectTo App-internal path after success (e.g. from AuthGuard {@code returnUrl}).
   */
  login(request: LoginRequest, redirectTo = '/dashboard'): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.AUTH_URL}/login`, request)
      .pipe(tap(response => this.handleAuthSuccess(response, redirectTo)));
  }

  /**
   * Registers a new account.
   *
   * The backend returns a JWT immediately after registration so the user
   * is logged in straight away – no separate login step required.
   *
   * @param request Registration payload.
   * @returns Observable that emits the {@link AuthResponse}.
   */
  register(request: RegisterRequest, redirectTo = '/dashboard'): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.AUTH_URL}/register`, request)
      .pipe(tap(response => this.handleAuthSuccess(response, redirectTo)));
  }

  /**
   * Clears the session (token + user) and redirects to the login page.
   * Safe to call even when the user is already logged out.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Initiates OAuth2 login flow with Google.
   * Redirects to the authorization endpoint configured in the environment.
   */
  loginWithGoogle(): void {
    window.location.href = environment.oauth2GoogleUrl;
  }

  /**
   * Handles the JWT token received via the OAuth2 callback URL.
   * Called by the OAuth2CallbackComponent after extracting the token
   * from the query string.
   *
   * @param token  The JWT returned from the backend OAuth2 success handler.
   * @param username Username decoded from the token (or the email used as username).
   * @param email  Email address from the OAuth2 provider.
   */
  handleOAuth2Token(token: string, username: string, email: string): void {
    const user: CurrentUser = { username, email, token };
    this.persistSession(token, user);
    this.currentUserSubject.next(user);
    this.navigateAfterAuth('/dashboard');
  }

  /**
   * Tries to bootstrap a session from a URL that may contain `token=...`.
   * Supports both direct URLs (`/dashboard?token=...`) and nested ones
   * (`/auth/login?returnUrl=%2Fdashboard%3Ftoken%3D...`).
   */
  tryHydrateSessionFromUrl(rawUrl: string): boolean {
    const targetUrl = (rawUrl ?? '').trim();
    if (!targetUrl) return false;

    const directToken = this.readQueryParam(targetUrl, 'token');
    const nestedReturnUrl = this.readQueryParam(targetUrl, 'returnUrl');
    const nestedToken = nestedReturnUrl
      ? this.readQueryParam(nestedReturnUrl, 'token')
      : null;
    const token = (directToken ?? nestedToken ?? '').trim();
    if (!token) return false;

    try {
      const payload = this.decodeJwtPayload(token);
      const username = String(payload['sub'] ?? payload['email'] ?? 'unknown');
      const email = String(payload['email'] ?? username);
      const user: CurrentUser = { username, email, token };
      this.persistSession(token, user);
      this.currentUserSubject.next(user);
      return true;
    } catch {
      return false;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Persists the token + user to localStorage and pushes the new user to the
   * reactive stream.  Called after every successful authentication.
   */
  private handleAuthSuccess(response: AuthResponse, redirectTo: string): void {
    const jwt = response.accessToken ?? response.token;
    if (!jwt) {
      console.error('Auth response missing token field', response);
      throw new Error('Invalid auth response: no token');
    }
    const user: CurrentUser = {
      username: response.username,
      email:    response.email,
      token:    jwt,
    };
    this.persistSession(jwt, user);
    this.currentUserSubject.next(user);
    this.navigateAfterAuth(redirectTo);
  }

  /** Only relative in-app URLs allowed (guards against open redirects). */
  private navigateAfterAuth(redirectTo: string): void {
    const url               = (redirectTo ?? '/dashboard').trim() || '/dashboard';
    const isInternalRelative = url.startsWith('/') && !url.startsWith('//');
    if (isInternalRelative) {
      this.router.navigateByUrl(url);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /** Writes token and serialised user to localStorage. */
  private persistSession(token: string, user: CurrentUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private readQueryParam(url: string, key: string): string | null {
    const queryStart = url.indexOf('?');
    if (queryStart < 0) return null;
    const query = url.substring(queryStart + 1);
    return new URLSearchParams(query).get(key);
  }

  private decodeJwtPayload(token: string): Record<string, unknown> {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) throw new Error('Invalid JWT structure');
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(pad);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  }

  /**
   * Reads the previously persisted user from localStorage on service init.
   * Returns null if no valid session exists.
   */
  private loadUserFromStorage(): CurrentUser | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const raw   = localStorage.getItem(this.USER_KEY);
      if (!token || !raw) {
        if (raw) localStorage.removeItem(this.USER_KEY);
        return null;
      }
      return JSON.parse(raw) as CurrentUser;
    } catch {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}
