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
