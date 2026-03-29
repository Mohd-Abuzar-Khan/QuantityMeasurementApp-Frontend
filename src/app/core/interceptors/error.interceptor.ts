import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';

/**
 * ErrorInterceptor – centralised HTTP error handling.
 *
 * <h3>Behaviour by status code:</h3>
 * <ul>
 *   <li><b>401 Unauthorized</b> – The token is missing, expired, or invalid.
 *       The user is logged out and redirected to the login page.</li>
 *   <li><b>403 Forbidden</b>   – The user is authenticated but lacks the
 *       required role.  Logged to console (extend to show a UI notification).</li>
 *   <li><b>All others</b>      – The error is re-thrown so the calling
 *       component's error handler can display an appropriate message.</li>
 * </ul>
 *
 * <p>Register alongside {@link JwtInterceptor} in app providers:
 * <pre>
 *   { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
 * </pre>
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private readonly authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next:    HttpHandler,
  ): Observable<HttpEvent<unknown>> {

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          // Token expired or revoked – force logout
          console.warn('401 Unauthorized – logging out');
          this.authService.logout();
        } else if (error.status === 403) {
          console.warn('403 Forbidden – insufficient permissions');
        }

        // Re-throw so individual components/services can react if needed
        return throwError(() => error);
      }),
    );
  }
}
