import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LoadingService } from './loading.service';
import { ErrorService } from './error.service';
import { Event } from '../models/user.model';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {}

  /**
   * Suscribe a cambios en tiempo real de los eventos.
   */
  subscribeToEvents(callback: (events: Event[]) => void): Unsubscribe {
    const eventsRef = collection(this.firebaseService.firestore, 'events');
    return onSnapshot(eventsRef, (snapshot) => {
      const events: Event[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Event));
      // Ordenar por fecha
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      callback(events);
    }, (error) => {
      console.error('Error escuchando eventos:', error);
      callback([]);
    });
  }

  async getEvents(): Promise<Event[]> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const eventsRef = collection(this.firebaseService.firestore, 'events');
          const snapshot = await getDocs(eventsRef);
          const events: Event[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as Event));
          events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return events;
        },
        "Cargando eventos..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar eventos", "No pudimos cargar los eventos.");
      throw error;
    }
  }

  async getEvent(id: string): Promise<Event | null> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const eventRef = doc(this.firebaseService.firestore, 'events', id);
          const docSnap = await getDoc(eventRef);
          if (!docSnap.exists()) return null;
          return { id: docSnap.id, ...docSnap.data() } as Event;
        },
        "Cargando evento..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar evento", "No pudimos cargar el evento.");
      throw error;
    }
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<string> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const eventsRef = collection(this.firebaseService.firestore, 'events');
          const newDocRef = doc(eventsRef);
          await setDoc(newDocRef, event);
          return newDocRef.id;
        },
        "Creando evento..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al crear evento", "No pudimos crear el evento.");
      throw error;
    }
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const eventRef = doc(this.firebaseService.firestore, 'events', id);
          const { id: _, ...eventData } = event as any;
          await setDoc(eventRef, eventData, { merge: true });
        },
        "Actualizando evento..."
      );
      this.errorService.showInfo("Éxito", "El evento ha sido actualizado ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al actualizar evento", "No pudimos actualizar el evento.");
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const eventRef = doc(this.firebaseService.firestore, 'events', id);
          await deleteDoc(eventRef);
        },
        "Eliminando evento..."
      );
      this.errorService.showInfo("Eliminado", "El evento ha sido eliminado ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al eliminar evento", "No pudimos eliminar el evento.");
      throw error;
    }
  }
}
