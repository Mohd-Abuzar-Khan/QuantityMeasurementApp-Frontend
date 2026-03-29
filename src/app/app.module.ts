import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './app.component';

import { JwtInterceptor }   from '@core/interceptors/jwt.interceptor';
import { ErrorInterceptor } from '@core/interceptors/error.interceptor';

import { HeaderComponent }       from '@shared/components/header/header.component';
import { NotificationComponent } from '@shared/components/notification/notification.component';
import { OAuth2CallbackComponent } from './features/auth/components/oauth2-callback/oauth2-callback.component';

/**
 * Root application module.
 *
 * Responsibilities:
 *  - Bootstrap the root component.
 *  - Import cross-cutting modules (HTTP, routing, animations).
 *  - Register global HTTP interceptors (JWT injection, error handling).
 *  - Declare shared components that appear in the root layout (header, footer).
 *
 * Feature modules (Auth, Dashboard, Measurement, History) are lazy-loaded via
 * the router and are NOT imported here.
 */
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NotificationComponent,
    OAuth2CallbackComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    // Attach JWT Bearer token to every outgoing HTTP request
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor,   multi: true },
    // Handle 401/403 responses globally
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
