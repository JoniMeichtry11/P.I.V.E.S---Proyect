import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
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

  constructor(private firebaseService: FirebaseService) {}

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
    const eventsRef = collection(this.firebaseService.firestore, 'events');
    const snapshot = await getDocs(eventsRef);
    const events: Event[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Event));
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return events;
  }

  async getEvent(id: string): Promise<Event | null> {
    const eventRef = doc(this.firebaseService.firestore, 'events', id);
    const docSnap = await getDoc(eventRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Event;
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<string> {
    const eventsRef = collection(this.firebaseService.firestore, 'events');
    const newDocRef = doc(eventsRef);
    await setDoc(newDocRef, event);
    return newDocRef.id;
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<void> {
    const eventRef = doc(this.firebaseService.firestore, 'events', id);
    const { id: _, ...eventData } = event as any;
    await setDoc(eventRef, eventData, { merge: true });
  }

  async deleteEvent(id: string): Promise<void> {
    const eventRef = doc(this.firebaseService.firestore, 'events', id);
    await deleteDoc(eventRef);
  }
}
