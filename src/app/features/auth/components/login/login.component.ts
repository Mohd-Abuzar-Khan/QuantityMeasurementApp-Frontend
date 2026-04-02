import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService }    from '@core/services/auth.service';
import { environment }    from '@environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  /** The reactive form group */
  loginForm!: FormGroup;

  /** Shown while the HTTP request is in flight */
  isLoading = false;

  /** Server-side error message to display below the form */
  errorMessage = '';

  /** Destination to navigate to after successful login (from query params) */
  returnUrl = '/dashboard';

  /** Expose to the template for the Google OAuth2 button href */
  readonly googleLoginUrl = environment.oauth2GoogleUrl;

  constructor(
    private readonly fb:          FormBuilder,
    private readonly authService: AuthService,
    private readonly route:       ActivatedRoute,
    private readonly router:      Router,
  ) {}

  ngOnInit(): void {
    // Build the reactive form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    // Capture returnUrl if the user was redirected here by AuthGuard
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';

    // If an OAuth token was embedded in this URL (or inside returnUrl), log in immediately.
    const currentUrl = window.location.pathname + window.location.search;
    if (this.authService.tryHydrateSessionFromUrl(currentUrl)) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const oauthErr = this.route.snapshot.queryParams['error'];
    if (oauthErr === 'oauth2_failed') {
      this.errorMessage = 'Google sign-in was cancelled or did not complete.';
    } else if (oauthErr === 'oauth2_token_invalid') {
      this.errorMessage = 'Sign-in token was invalid. Please try again.';
    }
  }

  // ── Form helpers (used in the template) ───────────────────────────────────

  get usernameControl() { return this.loginForm.get('username')!; }
  get passwordControl() { return this.loginForm.get('password')!; }

  /** Returns true if the field has been touched and is invalid */
  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName)!;
    return control.invalid && (control.dirty || control.touched);
  }

  // ── Form submission ────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields touched to trigger validation display
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value, this.returnUrl).subscribe({
      next: () => {
        // AuthService handles navigation on success
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading    = false;
        // Surface the backend error message, or a generic fallback
        this.errorMessage =
          err.error?.message ?? 'Login failed. Please check your credentials.';
      },
    });
  }
}
