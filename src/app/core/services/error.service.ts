import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  autoClose?: boolean;
  duration?: number; // en ms
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<ErrorNotification[]>([]);
  public errors$ = this.errorSubject.asObservable();
  private errorCounter = 0;

  constructor() {}

  /**
   * Muestra una notificación de error
   */
  showError(title: string, message: string, autoClose: boolean = true, duration: number = 5000): void {
    const notification: ErrorNotification = {
      id: `error-${this.errorCounter++}-${Date.now()}`,
      title,
      message,
      type: 'error',
      timestamp: new Date(),
      autoClose,
      duration
    };

    const currentErrors = this.errorSubject.value;
    this.errorSubject.next([...currentErrors, notification]);

    if (autoClose) {
      setTimeout(() => {
        this.dismissError(notification.id);
      }, duration);
    }
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(title: string, message: string, autoClose: boolean = true, duration: number = 5000): void {
    const notification: ErrorNotification = {
      id: `warning-${this.errorCounter++}-${Date.now()}`,
      title,
      message,
      type: 'warning',
      timestamp: new Date(),
      autoClose,
      duration
    };

    const currentErrors = this.errorSubject.value;
    this.errorSubject.next([...currentErrors, notification]);

    if (autoClose) {
      setTimeout(() => {
        this.dismissError(notification.id);
      }, duration);
    }
  }

  /**
   * Muestra una notificación informativa
   */
  showInfo(title: string, message: string, autoClose: boolean = true, duration: number = 3000): void {
    const notification: ErrorNotification = {
      id: `info-${this.errorCounter++}-${Date.now()}`,
      title,
      message,
      type: 'info',
      timestamp: new Date(),
      autoClose,
      duration
    };

    const currentErrors = this.errorSubject.value;
    this.errorSubject.next([...currentErrors, notification]);

    if (autoClose) {
      setTimeout(() => {
        this.dismissError(notification.id);
      }, duration);
    }
  }

  /**
   * Descarta una notificación de error
   */
  dismissError(id: string): void {
    const currentErrors = this.errorSubject.value;
    this.errorSubject.next(currentErrors.filter(error => error.id !== id));
  }

  /**
   * Descarta todas las notificaciones
   */
  dismissAll(): void {
    this.errorSubject.next([]);
  }

  /**
   * Retorna el observable de errores
   */
  getErrors$(): Observable<ErrorNotification[]> {
    return this.errors$;
  }

  /**
   * Maneja un error de manera automática mostrando un mensaje amigable
   */
  handleError(error: any, defaultTitle: string = '¡Algo salió mal!', defaultMessage: string = 'Por favor, intenta de nuevo más tarde.'): void {
    let errorTitle = defaultTitle;
    let errorMessage = defaultMessage;

    // Si el error tiene un mensaje personalizado
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    // Si es un objeto con propiedades de error
    else if (error?.error?.message) {
      errorMessage = error.error.message;
    }
    // Si es una respuesta HTTP con mensaje de error
    else if (error?.error?.error?.message) {
      errorMessage = error.error.error.message;
    }

    this.showError(errorTitle, errorMessage);
  }
}
