import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';

/**
 * Custom cross-field validator: ensures 'password' and 'confirmPassword' match.
 * Applied at the form-group level so it can read both control values.
 */
export const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm  = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
};

/**
 * SignupComponent – handles new user registration.
 *
 * Features:
 *  - Reactive form with username, email, password, confirmPassword, and optional name.
 *  - Cross-field validation: passwords must match (via {@link passwordMatchValidator}).
 *  - Inline validation messages before submission attempt.
 *  - Server-side error display (e.g. "Username already taken").
 *  - Navigates to /dashboard on successful registration (via AuthService).
 *  - Google OAuth2 sign-up button.
 */
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  isLoading    = false;
  errorMessage = '';
  successMessage = '';

  readonly googleSignupUrl = environment.oauth2GoogleUrl;

  constructor(
    private readonly fb:          FormBuilder,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        username: [
          '',
          [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
        ],
        email: [
          '',
          [Validators.required, Validators.email],
        ],
        password: [
          '',
          [Validators.required, Validators.minLength(8)],
        ],
        confirmPassword: [
          '',
          [Validators.required],
        ],
        name: [''],   // optional
      },
      { validators: passwordMatchValidator },
    );
  }

  // ── Convenience getters ────────────────────────────────────────────────────

  get usernameControl()        { return this.signupForm.get('username')!; }
  get emailControl()           { return this.signupForm.get('email')!; }
  get passwordControl()        { return this.signupForm.get('password')!; }
  get confirmPasswordControl() { return this.signupForm.get('confirmPassword')!; }

  /** True if the field has been interacted with AND contains an error. */
  isInvalid(controlName: string): boolean {
    const c = this.signupForm.get(controlName)!;
    return c.invalid && (c.dirty || c.touched);
  }

  /** True if the passwords don't match and both fields have been touched. */
  get passwordsMismatch(): boolean {
    return (
      this.signupForm.hasError('passwordMismatch') &&
      this.confirmPasswordControl.touched
    );
  }

  // ── Form submission ────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading      = true;
    this.errorMessage   = '';
    this.successMessage = '';

    const { username, email, password, name } = this.signupForm.value;

    this.authService.register({ username, email, password, name }).subscribe({
      next: () => {
        // AuthService navigates to /dashboard on success
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const body = err.error;
        const validation =
          Array.isArray(body?.messages) ? body.messages.join(' ') : null;
        this.errorMessage =
          body?.message ??
          validation ??
          (err.status === 0
            ? 'Cannot reach the server. Start Eureka, API Gateway (8080), and auth-service — or check the browser console.'
            : `Registration failed (${err.status ?? 'error'}). Please try again.`);
      },
    });
  }
}
