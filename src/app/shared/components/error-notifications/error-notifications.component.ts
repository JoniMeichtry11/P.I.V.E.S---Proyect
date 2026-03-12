import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService, ErrorNotification } from '../../../core/services/error.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-error-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-notifications.component.html',
  styleUrls: ['./error-notifications.component.css']
})
export class ErrorNotificationsComponent implements OnInit, OnDestroy {
  errors: ErrorNotification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.errorService.errors$
      .pipe(takeUntil(this.destroy$))
      .subscribe(errors => {
        this.errors = errors;
      });
  }

  dismiss(id: string): void {
    this.errorService.dismissError(id);
  }

  getIconByType(type: 'error' | 'warning' | 'info'): string {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
