// oauth2-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-oauth2-callback',
  template: `<p>Authenticating...</p>`
})
export class OAuth2CallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Read token from URL query param
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      // Store token — same place you store your regular JWT
      localStorage.setItem('auth_token', token);
      console.log('OAuth2 login successful');

      // Redirect to your main page
      this.router.navigate(['/dashboard']);
    } else {
      // No token — something went wrong
      console.error('OAuth2 callback: no token received');
      this.router.navigate(['/login']);
    }
  }
}