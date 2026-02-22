import { Injectable } from '@angular/core';
import { collection, addDoc } from 'firebase/firestore';
import { UserAccount, Booking } from '../models/user.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Genera un enlace de Google Calendar y lo abre en una nueva pestaña.
   */
  addToGoogleCalendar(childName: string, booking: Booking): void {
    const title = encodeURIComponent(`🚗 Reserva P.I.V.E.S - ${childName}`);
    const details = encodeURIComponent(`Reserva confirmada para ${childName}\nCoche: ${booking.car.name}\nCombustible: ${booking.car.pricePerSlot} Lts`);
    const location = encodeURIComponent('Pista P.I.V.E.S');
    
    // Formato de fecha para Google Calendar: YYYYMMDDTHHMMSSZ
    const datePart = booking.date.replace(/-/g, '');
    const timePart = booking.time.replace(/:/g, '');
    const start = `${datePart}T${timePart}00`;
    
    // Calcular fin (15 min después)
    const [hours, minutes] = booking.time.split(':').map(Number);
    let endMinutes = minutes + 15;
    let endHours = hours;
    if (endMinutes >= 60) {
      endMinutes = 0;
      endHours++;
    }
    const end = `${datePart}T${String(endHours).padStart(2, '0')}${String(endMinutes).padStart(2, '0')}00`;

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
    
    window.open(calendarUrl, '_blank');
  }

  /**
   * Genera el mensaje para WhatsApp y abre el enlace.
   */
  sendWhatsAppNotification(userAccount: UserAccount, childName: string, booking: Booking): void {
    const phone = userAccount.parent.phone?.replace(/\D/g, '');
    
    const dateFormatted = new Date(booking.date + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `¡Hola! 👋 Confirmamos tu reserva en el Programa P.I.V.E.S. para ${childName}:\n\n🚗 Coche: ${booking.car.name}\n🗓️ Fecha: ${dateFormatted}\n⏰ Hora: ${booking.time}\n⛽ Combustible usado: ${booking.car.pricePerSlot} Lts\n\n¡Te esperamos para una gran aventura de aprendizaje! 🚦`;
    
    const baseUri = phone ? `https://wa.me/${phone}` : `https://wa.me/`;
    const whatsappUrl = `${baseUri}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  }

  /**
   * NOTA: Este método requiere plan Blaze en Firebase para funcionar con la extensión "Trigger Email".
   * Se mantiene por si en el futuro se decide escalar o usar un backend propio.
   */
  async sendBookingEmail(userAccount: UserAccount, childName: string, booking: Booking): Promise<void> {
    if (!userAccount.parent.email) return;

    const dateFormatted = new Date(booking.date + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    try {
      const mailCollection = collection(this.firebaseService.firestore, 'mail');
      await addDoc(mailCollection, {
        to: userAccount.parent.email,
        message: {
          subject: '🎮 Reserva Confirmada - Programa P.I.V.E.S',
          text: `¡Hola ${userAccount.parent.name}! 👋\n\nConfirmamos la reserva para ${childName}:\n\n🚗 Coche: ${booking.car.name}\n🗓️ Fecha: ${dateFormatted}\n⏰ Hora: ${booking.time}\n⛽ Combustible: ${booking.car.pricePerSlot} Lts\n\n¡Te esperamos! 🚦`,
          html: `<div style="font-family: sans-serif;">...</div>` // Simplificado para brevedad, se puede expandir
        }
      });
    } catch (error) {
      console.error('Error al intentar enviar email:', error);
    }
  }
}
