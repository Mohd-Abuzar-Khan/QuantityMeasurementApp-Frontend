import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';

import { AuthService } from '@core/services/auth.service';

/**
 * OAuth2CallbackComponent – handles the redirect from the Spring Boot backend
 * after a successful Google OAuth2 login.
 *
 * <h3>Flow:</h3>
 * <ol>
 *   <li>Backend redirects to: {@code /oauth2/callback?token=<JWT>}</li>
 *   <li>This component reads the token from the query string.</li>
 *   <li>Decodes the JWT subject (username / email) from the payload.</li>
 *   <li>Delegates to {@link AuthService#handleOAuth2Token} to persist the
 *       session and navigate to the dashboard.</li>
 *   <li>If no token is present, redirects to the login page with an error
 *       query param so the user sees a meaningful message.</li>
 * </ol>
 *
 * <p>Route: {@code /oauth2/callback} in {@code AppRoutingModule} so it matches
 * {@code app.oauth2.redirect-uri} on the server.
 */
@Component({
  selector: 'app-oauth2-callback',
  template: `
    <div class="oauth-loading">
      <div class="spinner-large" aria-label="Completing sign-in…"></div>
      <p>Completing sign-in, please wait…</p>
    </div>
  `,
  styles: [`
    .oauth-loading {
      display:         flex;
      flex-direction:  column;
      align-items:     center;
      justify-content: center;
      min-height:      100vh;
      gap:             20px;
      font-family:     'DM Sans', sans-serif;
      color:           #6b7280;
    }
    .spinner-large {
      width:            48px;
      height:           48px;
      border:           4px solid rgba(255, 7, 59, 0.2);
      border-top-color: #FF073B;
      border-radius:    50%;
      animation:        spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class OAuth2CallbackComponent implements OnInit {

  constructor(
    private readonly route:       ActivatedRoute,
    private readonly router:      Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Use observable so query params are always resolved (snapshot can race in rare cases).
    this.route.queryParamMap.pipe(take(1)).subscribe(params => {
      const token =
        params.get('token') ?? this.parseTokenFromWindowSearch();

      if (!token?.trim()) {
        this.router.navigate(['/auth/login'], {
          queryParams: { error: 'oauth2_failed' },
        });
        return;
      }

      const emailFromServer = (params.get('email') ?? '').trim();
      if (emailFromServer) {
        this.authService.handleOAuth2Token(token, emailFromServer, emailFromServer);
        return;
      }

      try {
        const payload   = this.decodeJwtPayload(token);
        const username  = String(payload['sub'] ?? payload['email'] ?? 'unknown');
        const email     = String(payload['email'] ?? username);
        this.authService.handleOAuth2Token(token, username, email);
        this.router.navigate(['/dashboard']);
      } catch {
        this.router.navigate(['/auth/login'], {
          queryParams: { error: 'oauth2_token_invalid' },
        });
      }
    });
  }

  /** Fallback if the router has not yet parsed the query string. */
  private parseTokenFromWindowSearch(): string | null {
    try {
      return new URLSearchParams(window.location.search).get('token');
    } catch {
      return null;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Decodes the Base64Url-encoded JWT payload without verifying the signature.
   * Verification is not needed here because the token was just issued by our
   * own backend; the server will re-validate it on subsequent API calls.
   */
  private decodeJwtPayload(token: string): Record<string, unknown> {
    // JWT format: header.payload.signature  (all Base64Url encoded)
    const payloadPart = token.split('.')[1];
    if (!payloadPart) throw new Error('Invalid JWT structure');

    // Base64Url → Base64 → atob (requires length multiple of 4)
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const pad    = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(pad);
    const json   = atob(padded);
    return JSON.parse(json);
  }
}
