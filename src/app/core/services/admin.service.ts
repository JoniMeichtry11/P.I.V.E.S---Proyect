import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { LoadingService } from "./loading.service";
import { ErrorService } from "./error.service";
import { UserAccount, Child, Booking } from "../models/user.model";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

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

export const SUPER_ADMIN_EMAIL = "testahermanos@gmail.com"; // Puedes cambiar esto por tu email

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(
    private firebaseService: FirebaseService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {}

  async getAllUsers(): Promise<UserAccount[]> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const usersRef = collection(this.firebaseService.firestore, "users");
          const snapshot = await getDocs(usersRef);
          return snapshot.docs.map(
            (docSnap) =>
              ({
                uid: docSnap.id,
                ...docSnap.data(),
              }) as UserAccount,
          );
        },
        "Cargando usuarios..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar usuarios", "No pudimos cargar la lista de usuarios.");
      throw error;
    }
  }

  async getAllBookings(): Promise<BookingWithContext[]> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const users = await this.getAllUsers();
          const bookings: BookingWithContext[] = [];

          for (const user of users) {
            for (const child of user.children || []) {
              for (const booking of child.bookings || []) {
                bookings.push({
                  ...booking,
                  userName: user.parent?.name || "Sin nombre",
                  userEmail: user.parent?.email || "Sin email",
                  userUid: user.uid,
                  childName: child.name,
                  childId: child.id,
                });
              }
            }
          }

          return bookings.sort((a, b) => {
            const dateA = new Date(a.date + "T" + a.time);
            const dateB = new Date(b.date + "T" + b.time);
            return dateB.getTime() - dateA.getTime();
          });
        },
        "Cargando reservas..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar reservas", "No pudimos cargar la lista de reservas.");
      throw error;
    }
  }

  async getStats(): Promise<AdminStats> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
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
              for (const booking of child.bookings || []) {
                if (booking.status === "active") activeBookings++;
                else if (booking.status === "completed") completedBookings++;
                else if (booking.status === "cancelled") cancelledBookings++;
              }
            }
          }

          return {
            totalUsers: users.length,
            totalChildren,
            activeBookings,
            completedBookings,
            cancelledBookings,
            totalFuelInCirculation,
          };
        },
        "Cargando estadísticas..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar estadísticas", "No pudimos cargar las estadísticas.");
      throw error;
    }
  }

  async updateUserField(
    uid: string,
    data: Partial<UserAccount>,
  ): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const userRef = doc(this.firebaseService.firestore, "users", uid);
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) return;
          const current = docSnap.data() as Omit<UserAccount, "uid">;
          await setDoc(userRef, { ...current, ...data });
        },
        "Actualizando usuario..."
      );
      this.errorService.showInfo("Actualizado", "Los datos del usuario han sido actualizados ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al actualizar usuario", "No pudimos actualizar los datos del usuario.");
      throw error;
    }
  }

  async cancelBooking(
    uid: string,
    childId: string,
    bookingId: string,
  ): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const userRef = doc(this.firebaseService.firestore, "users", uid);
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) return;

          const userData = docSnap.data() as Omit<UserAccount, "uid">;
          const children = [...(userData.children || [])];
          const childIndex = children.findIndex((c) => c.id === childId);
          if (childIndex === -1) return;

          const child = { ...children[childIndex] };
          const booking = (child.bookings || []).find((b) => b.id === bookingId);
          if (!booking) return;

          child.bookings = child.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
          );
          // Devolver combustible
          child.progress = {
            ...child.progress,
            fuelLiters:
              (child.progress?.fuelLiters || 0) + (booking.car?.pricePerSlot || 0),
          };

          children[childIndex] = child;
          await setDoc(userRef, { ...userData, children });
        },
        "Cancelando reserva..."
      );
      this.errorService.showInfo("Cancelada", "La reserva ha sido cancelada ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al cancelar reserva", "No pudimos cancelar la reserva.");
      throw error;
    }
  }

  async completeBooking(
    uid: string,
    childId: string,
    bookingId: string,
  ): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const userRef = doc(this.firebaseService.firestore, "users", uid);
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) return;

          const userData = docSnap.data() as Omit<UserAccount, "uid">;
          const children = [...(userData.children || [])];
          const childIndex = children.findIndex((c) => c.id === childId);
          if (childIndex === -1) return;

          const child = { ...children[childIndex] };
          child.bookings = child.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "completed" as const } : b,
          );

          children[childIndex] = child;
          await setDoc(userRef, { ...userData, children });
        },
        "Completando reserva..."
      );
      this.errorService.showInfo("Completada", "La reserva ha sido marcada como completada ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al completar reserva", "No pudimos completar la reserva.");
      throw error;
    }
  }

  async addFuelToChild(
    uid: string,
    childId: string,
    amount: number,
  ): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const userRef = doc(this.firebaseService.firestore, "users", uid);
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) return;

          const userData = docSnap.data() as Omit<UserAccount, "uid">;
          const children = [...(userData.children || [])];
          const childIndex = children.findIndex((c) => c.id === childId);
          if (childIndex === -1) return;

          const child = { ...children[childIndex] };
          child.progress = {
            ...child.progress,
            fuelLiters: (child.progress?.fuelLiters || 0) + amount,
          };

          children[childIndex] = child;
          await setDoc(userRef, { ...userData, children });
        },
        "Agregando combustible..."
      );
      this.errorService.showInfo("Agregado", `Se han añadido ${amount}L de combustible ⛽`);
    } catch (error) {
      this.errorService.handleError(error, "Error al agregar combustible", "No pudimos agregar el combustible.");
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    // 1. Eliminar de Firestore
    const userRef = doc(this.firebaseService.firestore, "users", uid);
    await deleteDoc(userRef);

    // 2. Eliminar de Firebase Authentication a través del backend
    try {
      const idToken = await this.firebaseService.auth.currentUser?.getIdToken();
      await this.http
        .post(
          `${environment.backendUrl}/api/delete-user/${uid}`,
          {},
          {
            headers: { Authorization: `Bearer ${idToken}` },
          },
        )
        .toPromise();
    } catch (error) {
      console.error("Error al eliminar usuario de Authentication:", error);
      // Opcional: podrías lanzar un error si es crítico que se eliminen de ambos
    }
  }

  async verifyUser(uid: string): Promise<void> {
    try {
      const idToken = await this.firebaseService.auth.currentUser?.getIdToken();
      await this.http
        .post(
          `${environment.backendUrl}/api/verify-user/${uid}`,
          {},
          {
            headers: { Authorization: `Bearer ${idToken}` },
          },
        )
        .toPromise();
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      throw error;
    }
  }

  async isUserAdmin(uid: string, email?: string): Promise<boolean> {
    if (email === SUPER_ADMIN_EMAIL) return true;

    const userRef = doc(this.firebaseService.firestore, "users", uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return false;
    const data = docSnap.data();
    return data?.["isAdmin"] === true;
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
      for (const child of user.children || []) {
        for (const booking of child.bookings || []) {
          if (
            booking.date === date &&
            booking.car?.id === carId &&
            booking.status === "active"
          ) {
            bookedSlots.push(booking.time);
          }
        }
      }
    }

    return bookedSlots;
  }
}
