import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, Notification } from './notification.service';

/**
 * NotificationComponent – renders global toast notifications.
 *
 * Placed once in the root {@link AppComponent} template.
 * Subscribes to {@link NotificationService} and displays transient messages.
 * Each toast auto-dismisses after 4 seconds.
 */
@Component({
  selector: 'app-notification',
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <div
        *ngFor="let n of notifications; trackBy: trackById"
        class="toast"
        [class.toast--success]="n.type === 'success'"
        [class.toast--error]="n.type === 'error'"
        [class.toast--info]="n.type === 'info'"
        role="alert"
      >
        <span class="toast-icon">
          {{ n.type === 'success' ? '✓' : n.type === 'error' ? '✗' : 'ℹ' }}
        </span>
        <span class="toast-message">{{ n.message }}</span>
        <button class="toast-close" (click)="dismiss(n.id)" aria-label="Dismiss">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right:  24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      animation: slideIn 0.25s ease;
    }
    .toast.toast--success { background: #16a34a; color: #fff; }
    .toast.toast--error   { background: #dc2626; color: #fff; }
    .toast.toast--info    { background: #1a1a2e; color: #fff; }
    .toast-icon    { font-size: 16px; font-weight: 700; }
    .toast-message { flex: 1; }
    .toast-close   {
      background: none; border: none; color: inherit;
      font-size: 18px; cursor: pointer; opacity: 0.8; line-height: 1;
    }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `],
})
export class NotificationComponent implements OnInit, OnDestroy {

  notifications: Notification[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => (this.notifications = notifications));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  trackById(_: number, n: Notification): string {
    return n.id;
  }
}
