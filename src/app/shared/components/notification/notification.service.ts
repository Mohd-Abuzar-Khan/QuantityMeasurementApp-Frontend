import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id:      string;
  type:    NotificationType;
  message: string;
}

/**
 * NotificationService – a simple toast/snackbar manager.
 *
 * Usage in any component or service:
 * <pre>
 *   this.notifications.success('Saved!');
 *   this.notifications.error('Something went wrong.');
 *   this.notifications.info('Processing…');
 * </pre>
 *
 * Toasts auto-dismiss after {@link AUTO_DISMISS_MS} milliseconds.
 * The {@link NotificationComponent} subscribes to {@link notifications$} and
 * renders the current list.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  private static readonly AUTO_DISMISS_MS = 4000;

  private readonly list$ = new BehaviorSubject<Notification[]>([]);

  /** Observable stream of active notifications. */
  readonly notifications$ = this.list$.asObservable();

  /** Shows a success toast. */
  success(message: string): void {
    this.add('success', message);
  }

  /** Shows an error toast. */
  error(message: string): void {
    this.add('error', message);
  }

  /** Shows an informational toast. */
  info(message: string): void {
    this.add('info', message);
  }

  /** Manually removes a toast by its ID. */
  dismiss(id: string): void {
    this.list$.next(this.list$.value.filter(n => n.id !== id));
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private add(type: NotificationType, message: string): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const notification: Notification = { id, type, message };

    this.list$.next([...this.list$.value, notification]);

    // Auto-dismiss
    setTimeout(() => this.dismiss(id), NotificationService.AUTO_DISMISS_MS);
  }
}
