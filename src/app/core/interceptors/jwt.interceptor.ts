import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '@core/services/auth.service';


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
