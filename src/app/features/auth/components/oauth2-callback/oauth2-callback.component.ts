import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-oauth2-callback',
  template: `<p>Authenticating...</p>`,
})
export class OAuth2CallbackComponent implements OnInit {

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (token) {
      this.authService.handleOAuth2Token(token);
      return;
    }

    this.router.navigate(['/auth/login'], {
      queryParams: { error: error ?? 'oauth2_token_invalid' },
    });
  }
}
