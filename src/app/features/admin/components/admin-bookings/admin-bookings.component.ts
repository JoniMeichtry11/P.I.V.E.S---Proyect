import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, BookingWithContext } from '../../../../core/services/admin.service';
import { CAR_MODELS } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.css'],
  standalone: false
})
export class AdminBookingsComponent implements OnInit {
  allBookings: BookingWithContext[] = [];
  filteredBookings: BookingWithContext[] = [];
  loading = true;

  // Filtros
  filterStatus: '' | 'active' | 'completed' | 'cancelled' = '';
  filterCar = '';
  filterDate = '';

  // Modal de confirmación
  confirmModal = {
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  };

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadBookings();
  }

  async loadBookings(): Promise<void> {
    this.loading = true;
    try {
      this.allBookings = await this.adminService.getAllBookings();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    this.loading = false;
  }

  get carModels() {
    return CAR_MODELS;
  }

  applyFilters(): void {
    this.filteredBookings = this.allBookings.filter(b => {
      if (this.filterStatus && b.status !== this.filterStatus) return false;
      if (this.filterCar && b.car?.id !== this.filterCar) return false;
      if (this.filterDate && b.date !== this.filterDate) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterCar = '';
    this.filterDate = '';
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activa',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  }

  confirmCancelBooking(booking: BookingWithContext): void {
    this.confirmModal = {
      isOpen: true,
      title: '❌ Cancelar Reserva',
      message: `¿Cancelar la reserva de "${booking.childName}" (${booking.car?.name}) del ${booking.date} a las ${booking.time}? Se le devolverá el combustible.`,
      action: async () => {
        await this.adminService.cancelBooking(booking.userUid, booking.childId, booking.id);
        this.confirmModal.isOpen = false;
        await this.loadBookings();
      }
    };
  }

  confirmCompleteBooking(booking: BookingWithContext): void {
    this.confirmModal = {
      isOpen: true,
      title: '✅ Completar Reserva',
      message: `¿Marcar como completada la reserva de "${booking.childName}" (${booking.car?.name}) del ${booking.date}?`,
      action: async () => {
        await this.adminService.completeBooking(booking.userUid, booking.childId, booking.id);
        this.confirmModal.isOpen = false;
        await this.loadBookings();
      }
    };
  }

  closeConfirmModal(): void {
    this.confirmModal.isOpen = false;
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
