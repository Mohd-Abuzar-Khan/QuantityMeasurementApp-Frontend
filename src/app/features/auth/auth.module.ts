import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent }          from './components/login/login.component';
import { SignupComponent }          from './components/signup/signup.component';

/**
 * Auth routes:
 *  /auth/login          → LoginComponent
 *  /auth/register       → SignupComponent
 *  /auth                → redirect to /auth/login
 *
 *  /oauth2/callback is registered in AppRoutingModule so it matches the backend
 *  {@code app.oauth2.redirect-uri} exactly.
 */
const routes: Routes = [
  { path: '',        redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',   component: LoginComponent },
  { path: 'register', component: SignupComponent },
];

/**
 * AuthModule – feature module for all authentication UI.
 *
 * Lazy-loaded from the root router; keeps auth-related code isolated.
 * Uses ReactiveFormsModule for type-safe form handling.
 */
@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class AuthModule {}
