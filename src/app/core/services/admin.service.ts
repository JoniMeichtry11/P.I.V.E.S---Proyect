import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { UserAccount, Child, Booking } from '../models/user.model';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export interface BookingWithContext extends Booking {
  userName: string;
  userEmail: string;
  userUid: string;
  childName: string;
  childId: string;
}

export interface AdminStats {
  totalUsers: number;
  totalChildren: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalFuelInCirculation: number;
}

export const SUPER_ADMIN_EMAIL = 'testahermanos@gmail.com'; // Puedes cambiar esto por tu email

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private firebaseService: FirebaseService) {}

  async getAllUsers(): Promise<UserAccount[]> {
    const usersRef = collection(this.firebaseService.firestore, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(docSnap => ({
      uid: docSnap.id,
      ...docSnap.data()
    } as UserAccount));
  }

  async getAllBookings(): Promise<BookingWithContext[]> {
    const users = await this.getAllUsers();
    const bookings: BookingWithContext[] = [];

    for (const user of users) {
      for (const child of (user.children || [])) {
        for (const booking of (child.bookings || [])) {
          bookings.push({
            ...booking,
            userName: user.parent?.name || 'Sin nombre',
            userEmail: user.parent?.email || 'Sin email',
            userUid: user.uid,
            childName: child.name,
            childId: child.id
          });
        }
      }
    }

    return bookings.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async getStats(): Promise<AdminStats> {
    const users = await this.getAllUsers();
    let totalChildren = 0;
    let activeBookings = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;
    let totalFuelInCirculation = 0;

    for (const user of users) {
      const children = user.children || [];
      totalChildren += children.length;
      for (const child of children) {
        totalFuelInCirculation += child.progress?.fuelLiters || 0;
        for (const booking of (child.bookings || [])) {
          if (booking.status === 'active') activeBookings++;
          else if (booking.status === 'completed') completedBookings++;
          else if (booking.status === 'cancelled') cancelledBookings++;
        }
      }
    }

    return {
      totalUsers: users.length,
      totalChildren,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalFuelInCirculation
    };
  }

  async updateUserField(uid: string, data: Partial<UserAccount>): Promise<void> {
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;
    const current = docSnap.data() as Omit<UserAccount, 'uid'>;
    await setDoc(userRef, { ...current, ...data });
  }

  async cancelBooking(uid: string, childId: string, bookingId: string): Promise<void> {
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data() as Omit<UserAccount, 'uid'>;
    const children = [...(userData.children || [])];
    const childIndex = children.findIndex(c => c.id === childId);
    if (childIndex === -1) return;

    const child = { ...children[childIndex] };
    const booking = (child.bookings || []).find(b => b.id === bookingId);
    if (!booking) return;

    child.bookings = child.bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
    // Devolver combustible
    child.progress = {
      ...child.progress,
      fuelLiters: (child.progress?.fuelLiters || 0) + (booking.car?.pricePerSlot || 0)
    };

    children[childIndex] = child;
    await setDoc(userRef, { ...userData, children });
  }

  async completeBooking(uid: string, childId: string, bookingId: string): Promise<void> {
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data() as Omit<UserAccount, 'uid'>;
    const children = [...(userData.children || [])];
    const childIndex = children.findIndex(c => c.id === childId);
    if (childIndex === -1) return;

    const child = { ...children[childIndex] };
    child.bookings = child.bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'completed' as const } : b
    );

    children[childIndex] = child;
    await setDoc(userRef, { ...userData, children });
  }

  async addFuelToChild(uid: string, childId: string, amount: number): Promise<void> {
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data() as Omit<UserAccount, 'uid'>;
    const children = [...(userData.children || [])];
    const childIndex = children.findIndex(c => c.id === childId);
    if (childIndex === -1) return;

    const child = { ...children[childIndex] };
    child.progress = {
      ...child.progress,
      fuelLiters: (child.progress?.fuelLiters || 0) + amount
    };

    children[childIndex] = child;
    await setDoc(userRef, { ...userData, children });
  }

  async deleteUser(uid: string): Promise<void> {
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    await deleteDoc(userRef);
  }

  async isUserAdmin(uid: string, email?: string): Promise<boolean> {
    if (email === SUPER_ADMIN_EMAIL) return true;
    
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return false;
    const data = docSnap.data();
    return data?.['isAdmin'] === true;
  }

  async toggleAdminRole(uid: string, isAdmin: boolean): Promise<void> {
    await this.updateUserField(uid, { isAdmin });
  }

  /**
   * Obtiene todos los slots reservados globalmente para una fecha y auto específicos.
   * Reemplaza la lógica de collectionGroup que no funciona.
   */
  async getGloballyBookedSlots(date: string, carId: string): Promise<string[]> {
    const users = await this.getAllUsers();
    const bookedSlots: string[] = [];

    for (const user of users) {
      for (const child of (user.children || [])) {
        for (const booking of (child.bookings || [])) {
          if (booking.date === date && booking.car?.id === carId && booking.status === 'active') {
            bookedSlots.push(booking.time);
          }
        }
      }
    }

    return bookedSlots;
  }
}
