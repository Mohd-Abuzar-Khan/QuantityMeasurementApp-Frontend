import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '@core/services/auth.service';

/**
 * JwtInterceptor – automatically attaches the Bearer JWT to every outgoing
 * HTTP request that targets the backend API.
 *
 * <h3>How it works:</h3>
 * <ol>
 *   <li>Reads the current token from {@link AuthService}.</li>
 *   <li>If a token is present, clones the request and adds the
 *       {@code Authorization: Bearer <token>} header.</li>
 *   <li>Passes the (possibly modified) request to the next handler.</li>
 * </ol>
 *
 * <p>Requests that do not carry a token (e.g. to /login or /register)
 * are forwarded unchanged – the backend public endpoints do not require
 * an Authorization header.
 *
 * <p>Register this interceptor in the providers array of {@code AppModule}
 * or {@code app.config.ts}:
 * <pre>
 *   { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
 * </pre>
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private readonly authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next:    HttpHandler,
  ): Observable<HttpEvent<unknown>> {

    const token = this.authService.token;

    // Clone and attach the Authorization header only when a token exists
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(request);
  }
}
