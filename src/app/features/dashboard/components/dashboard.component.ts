import { Component, OnInit } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { CurrentUser } from '@core/models/auth.models';

/**
 * DashboardComponent – post-login home with welcome banner and embedded measurement UI.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  currentUser: CurrentUser | null = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
  }
}
