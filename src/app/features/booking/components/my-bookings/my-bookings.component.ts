import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { Booking, Child } from '../../../../core/models/user.model';

interface BookingWithChild extends Booking {
  childName: string;
  childAvatar: string;
  childId: string;
}

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  standalone: false
})
export class MyBookingsComponent implements OnInit {
  bookings: BookingWithChild[] = [];
  loading = true;

  constructor(
    private userService: UserService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUserAccount$.subscribe(account => {
      if (account) {
        this.processBookings(account.children);
        this.loading = false;
      }
    });
  }

  processBookings(children: Child[]): void {
    const allBookings: BookingWithChild[] = [];
    
    children.forEach(child => {
      if (child.bookings) {
        child.bookings.forEach((booking: Booking) => {
          allBookings.push({
            ...booking,
            childName: child.name,
            childAvatar: child.avatar,
            childId: child.id
          });
        });
      }
    });

    // Ordenar por fecha y hora (más recientes primero)
    this.bookings = allBookings.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
      const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
      
      // Prioridad a las activas primero
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      
      // Luego por fecha descendente
      return dateB.getTime() - dateA.getTime();
    });
  }

  async cancelBooking(booking: BookingWithChild): Promise<void> {
    if (booking.status !== 'active') return;

    if (confirm(`¿Estás seguro de que quieres cancelar la reserva de ${booking.childName}? Se te devolverán los ${booking.car.pricePerSlot}⛽.`)) {
      try {
        await this.userService.cancelBooking(booking.id, booking.childId);
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Ocurrió un error al cancelar la reserva.');
      }
    }
  }

  formatDate(dateStr: string): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', options);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activa';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }
}
