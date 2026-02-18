import { Component, Input, OnInit } from '@angular/core';
import { Child, Booking } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-notification-manager',
  templateUrl: './notification-manager.component.html',
  styleUrls: ['./notification-manager.component.css'],
  standalone: false
})
export class NotificationManagerComponent implements OnInit {
  @Input() activeChild: Child | null = null;
  
  reminder: { booking: Booking; type: 'dayBefore' | 'sameDay' } | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.checkReminders();
  }

  private checkReminders(): void {
    if (!this.activeChild) {
      this.reminder = null;
      return;
    }

    const activeBookings = (this.activeChild.bookings || []).filter(b => b.status === 'active');
    if (activeBookings.length === 0) {
      this.reminder = null;
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const booking of activeBookings) {
      const bookingDate = new Date(booking.date + 'T00:00:00');
      bookingDate.setHours(0, 0, 0, 0);

      const timeDiff = bookingDate.getTime() - now.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24);

      if (dayDiff === 1 && !booking.remindersSent.dayBefore) {
        this.reminder = { booking, type: 'dayBefore' };
        return;
      }

      if (dayDiff === 0 && !booking.remindersSent.sameDay) {
        this.reminder = { booking, type: 'sameDay' };
        return;
      }
    }

    this.reminder = null;
  }

  handleReprogram(): void {
    if (!this.reminder) return;
    this.userService.cancelBooking(this.reminder.booking.id);
    this.updateReminders(this.reminder.booking.id, this.reminder.type);
    this.reminder = null;
  }

  handleAcknowledge(): void {
    if (!this.reminder) return;
    this.updateReminders(this.reminder.booking.id, this.reminder.type);
    this.reminder = null;
  }

  private updateReminders(bookingId: string, reminderType: 'dayBefore' | 'sameDay'): void {
    if (!this.activeChild) return;
    
    const updatedBookings = this.activeChild.bookings.map(b =>
      b.id === bookingId
        ? { ...b, remindersSent: { ...b.remindersSent, [reminderType]: true } }
        : b
    );

    this.userService.updateActiveChild({ bookings: updatedBookings });
  }

  get dateFormatted(): string {
    if (!this.reminder) return '';
    return new Date(this.reminder.booking.date + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}


