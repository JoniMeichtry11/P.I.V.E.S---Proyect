import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    message: 'Cargando...',
  });

  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Muestra el loader con un mensaje personalizado
   */
  show(message: string = 'Cargando...'): void {
    this.loadingSubject.next({
      isLoading: true,
      message,
    });
  }

  /**
   * Oculta el loader
   */
  hide(): void {
    this.loadingSubject.next({
      isLoading: false,
      message: '',
    });
  }

  /**
   * Ejecuta una función asincrónica y gestiona el loader automáticamente
   */
  async executeWithLoading<T>(
    asyncFn: () => Promise<T>,
    message: string = 'Cargando...'
  ): Promise<T> {
    try {
      this.show(message);
      const result = await asyncFn();
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }

  /**
   * Obtiene el estado actual del loading
   */
  getCurrentState(): LoadingState {
    return this.loadingSubject.value;
  }

  /**
   * Retorna el observable del estado
   */
  getLoading$(): Observable<LoadingState> {
    return this.loading$;
  }

  /**
   * Maneja un observable y gestiona el loader
   */
  observeWithLoading<T>(
    observable: Observable<T>,
    message: string = 'Cargando...'
  ): Observable<T> {
    return new Observable(subscriber => {
      this.show(message);
      return observable.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (error) => {
          this.hide();
          subscriber.error(error);
        },
        complete: () => {
          this.hide();
          subscriber.complete();
        }
      });
    });
  }
}
