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

    const firebaseMessage = this.getFriendlyFirebaseMessage(error);

    if (firebaseMessage) {
      errorMessage = firebaseMessage;
    }
    // Si el error tiene un mensaje personalizado y NO es un mensaje crudo de Firebase
    else if (error instanceof Error && error.message && !error.message.startsWith('Firebase:')) {
      errorMessage = error.message;
    }
    // Si es un objeto con propiedades de error
    else if (error?.error?.message && typeof error.error.message === 'string' && !error.error.message.startsWith('Firebase:')) {
      errorMessage = error.error.message;
    }
    // Si es una respuesta HTTP con mensaje de error
    else if (error?.error?.error?.message && typeof error.error.error.message === 'string' && !error.error.error.message.startsWith('Firebase:')) {
      errorMessage = error.error.error.message;
    }

    this.showError(errorTitle, errorMessage);
  }

  /**
   * Extrae y mapea un mensaje de error amigable en español si proviene de Firebase
   */
  private getFriendlyFirebaseMessage(error: any): string | null {
    if (!error) return null;

    let code = error.code;
    const rawMessage = typeof error === 'string' ? error : (error.message || '');

    // Extraer código de error si el objeto o mensaje contiene una clave auth/...
    if (!code && typeof rawMessage === 'string') {
      const match = rawMessage.match(/auth\/[a-z-]+/i);
      if (match) {
        code = match[0];
      }
    }

    if (!code) return null;

    const firebaseAuthErrors: Record<string, string> = {
      'auth/invalid-credential': 'El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus datos e inténtalo de nuevo.',
      'auth/wrong-password': 'La contraseña ingresada es incorrecta. Por favor, inténtalo de nuevo.',
      'auth/user-not-found': 'No encontramos ninguna cuenta registrada con este correo electrónico.',
      'auth/invalid-email': 'El correo electrónico ingresado no tiene un formato válido.',
      'auth/email-already-in-use': 'Este correo electrónico ya se encuentra registrado. Intenta iniciar sesión.',
      'auth/weak-password': 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Por favor, contacta con soporte.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por seguridad, por favor intenta más tarde.',
      'auth/network-request-failed': 'Error de conexión. Por favor, verifica tu conexión a internet.',
      'auth/requires-recent-login': 'Por seguridad, debes haber iniciado sesión recientemente para realizar esta acción.',
      'auth/expired-action-code': 'El enlace de verificación ha expirado. Por favor solicita uno nuevo.',
      'auth/invalid-action-code': 'El enlace de verificación es inválido o ya ha sido utilizado.',
    };

    if (firebaseAuthErrors[code]) {
      return firebaseAuthErrors[code];
    }

    if (typeof code === 'string' && code.startsWith('auth/')) {
      return 'No se pudo completar la autenticación. Por favor, verifica tus datos e inténtalo de nuevo.';
    }

    return null;
  }
}
