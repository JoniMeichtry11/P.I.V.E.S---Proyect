import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Child, CarModel, UserAccount, Booking } from '../../../../core/models/user.model';
import { CAR_MODELS, TIME_SLOTS } from '../../../../core/constants/app.constants';
import { Subscription } from 'rxjs';

interface ModalAction {
  text: string;
  onClick: () => void;
  className: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  content: string | null; // texto plano (sin HTML)
  actions: ModalAction[];
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  standalone: false
})
export class BookingComponent implements OnInit, OnDestroy {
  activeChild: Child | null = null;
  currentUserAccount: UserAccount | null = null;
  
  step = 1;
  selectedCar: CarModel | null = null;
  selectedDate = '';
  selectedTime = '';
  globallyBookedSlots: string[] = [];
  modal: ModalState = {
    isOpen: false,
    title: '',
    content: null,
    actions: []
  };
  modalType: 'default' | 'reassign' = 'default';
  reassignCandidates: Child[] = [];
  reassignTargetId = '';
  confirmedForChildName = '';

  private subscriptions = new Subscription();

  router: Router;

  constructor(
    private _router: Router,
    private userService: UserService,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.router = this._router;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.userService.activeChild$.subscribe(child => {
        this.activeChild = child;
      })
    );

    this.subscriptions.add(
      this.userService.currentUserAccount$.subscribe(account => {
        this.currentUserAccount = account;
      })
    );

    // Cargar slots ocupados cuando cambian el coche o la fecha
    this.loadBookedSlots();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get userFuel(): number {
    return this.activeChild?.progress.fuelLiters || 0;
  }

  get minDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  }

  get carModels(): CarModel[] {
    return CAR_MODELS;
  }

  get timeSlots(): typeof TIME_SLOTS {
    return TIME_SLOTS;
  }

  async loadBookedSlots(): Promise<void> {
    if (this.step === 2 && this.selectedCar && this.selectedDate) {
      try {
        this.globallyBookedSlots = await this.adminService.getGloballyBookedSlots(
          this.selectedDate,
          this.selectedCar.id
        );
      } catch (error) {
        console.error('Error loading booked slots:', error);
        this.globallyBookedSlots = [];
      }
    } else {
      this.globallyBookedSlots = [];
    }
  }

  handleSelectCar(car: CarModel): void {
    if (this.userFuel < car.pricePerSlot) {
      this.modal = {
        isOpen: true,
        title: '¡Te falta combustible!',
        content: `El ${car.name} consume ${car.pricePerSlot} Litros. Tú tienes ${this.userFuel} Litros ⛽.`,
        actions: [
          { 
            text: 'Entendido', 
            onClick: () => this.closeModal(), 
            className: 'bg-slate-400 hover:bg-slate-500' 
          },
          { 
            text: 'Ir a cargar ⛽', 
            onClick: () => { this.closeModal(); this.router.navigate(['/buy-fuel']); }, 
            className: 'bg-green-500 hover:bg-green-600' 
          }
        ]
      };
      this.modalType = 'default';
      this.reassignCandidates = [];
      return;
    }
    this.selectedCar = car;
    this.step = 2;
    this.loadBookedSlots();
  }

  handleDateTimeSubmit(): void {
    if (!this.selectedDate || !this.selectedTime) {
      alert('Por favor, selecciona una fecha y hora.');
      return;
    }

    const existingBooking = (this.activeChild?.bookings || []).find(
      b => b.date === this.selectedDate && b.time === this.selectedTime && b.status === 'active'
    );

    if (existingBooking) {
      const otherChildren = (this.currentUserAccount?.children || []).filter(c => c.id !== this.activeChild?.id);

      if (otherChildren.length > 0) {
        this.reassignTargetId = otherChildren[0].id;
        this.reassignCandidates = otherChildren;
        this.modalType = 'reassign';
        this.modal = {
          isOpen: true,
          title: '📅 Conflicto de Horario',
          content: `${this.activeChild?.name} ya tiene una reserva a las ${this.selectedTime}. ¿Quieres reservar este coche para otro hermano/a?`,
          actions: [
            { text: 'Cancelar', onClick: () => this.closeModal(), className: 'bg-slate-400 hover:bg-slate-500' },
            { text: 'Sí, reservar para otro', onClick: () => this.handleReassignBooking(), className: 'bg-green-500 hover:bg-green-600' }
          ]
        };
      } else {
        this.modalType = 'default';
        this.reassignCandidates = [];
        this.modal = {
          isOpen: true,
          title: '📅 Ya tienes planes',
          content: 'Ya tienes una reserva a esta hora. ¡Elige otro horario para disfrutar ambos!',
          actions: [{ text: 'Entendido', onClick: () => this.closeModal(), className: 'bg-blue-500 hover:bg-blue-600' }]
        };
      }
      return;
    }

    this.step = 3;
  }

  async handleReassignBooking(): Promise<void> {
    if (!this.reassignTargetId || !this.selectedCar || !this.selectedDate || !this.selectedTime) return;

    const targetChild = this.currentUserAccount?.children.find(c => c.id === this.reassignTargetId);
    if (!targetChild) return;

    if (targetChild.progress.fuelLiters < this.selectedCar.pricePerSlot) {
      alert(`${targetChild.name} no tiene suficiente combustible para esta reserva.`);
      return;
    }

    const success = await this.userService.addBookingForChild(this.reassignTargetId, {
      car: this.selectedCar,
      date: this.selectedDate,
      time: this.selectedTime
    });

    if (success) {
      this.closeModal();
      this.confirmedForChildName = targetChild.name;
      this.step = 4;
    } else {
      alert('Ocurrió un error al reasignar la reserva.');
    }
  }

  async handleConfirmAndPay(): Promise<void> {
    if (!this.selectedCar || !this.selectedDate || !this.selectedTime) return;

    if ((this.activeChild?.progress.fuelLiters || 0) < this.selectedCar.pricePerSlot) {
      alert('Error: No hay suficiente combustible.');
      return;
    }

    const success = await this.userService.addBooking({
      car: this.selectedCar,
      date: this.selectedDate,
      time: this.selectedTime
    });

    if (success) {
      this.confirmedForChildName = this.activeChild?.name || '';
      this.step = 4;
    } else {
      alert('Ocurrió un error al procesar tu reserva. Inténtalo de nuevo.');
    }
  }

  handleWhatsAppNotification(): void {
    if (!this.selectedCar || !this.selectedDate || !this.selectedTime || !this.currentUserAccount) return;

    const booking: Booking = {
      id: '',
      status: 'active',
      date: this.selectedDate,
      time: this.selectedTime,
      car: this.selectedCar,
      remindersSent: { dayBefore: false, sameDay: false }
    };

    this.notificationService.sendWhatsAppNotification(
      this.currentUserAccount,
      this.confirmedForChildName,
      booking
    );
  }

  handleAddToCalendar(): void {
    if (!this.selectedCar || !this.selectedDate || !this.selectedTime) return;

    const booking: Booking = {
      id: '',
      status: 'active',
      date: this.selectedDate,
      time: this.selectedTime,
      car: this.selectedCar,
      remindersSent: { dayBefore: false, sameDay: false }
    };

    this.notificationService.addToGoogleCalendar(this.confirmedForChildName, booking);
  }

  resetBooking(): void {
    this.step = 1;
    this.selectedCar = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.confirmedForChildName = '';
  }

  closeModal(): void {
    this.modal = { ...this.modal, isOpen: false };
    this.modalType = 'default';
    this.reassignCandidates = [];
  }

  get dateFormatted(): string {
    if (!this.selectedDate) return '';
    return new Date(this.selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  }

  get fullDateFormatted(): string {
    if (!this.selectedDate) return '';
    return new Date(this.selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  get remainingFuel(): number {
    if (!this.selectedCar) return this.userFuel;
    return this.userFuel - this.selectedCar.pricePerSlot;
  }
}

