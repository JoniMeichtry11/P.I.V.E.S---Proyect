import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LoadingService } from './loading.service';
import { ErrorService } from './error.service';
import { FuelCoupon } from '../models/user.model';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  increment,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private readonly collectionName = 'coupons';

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {}

  async getCoupons(): Promise<FuelCoupon[]> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const couponsRef = collection(this.firebaseService.firestore, this.collectionName);
          const snapshot = await getDocs(couponsRef);
          return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FuelCoupon));
        },
        "Cargando cupones..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar cupones", "No pudimos cargar los cupones.");
      throw error;
    }
  }

  async getCouponByCode(code: string): Promise<FuelCoupon | null> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const docRef = doc(this.firebaseService.firestore, this.collectionName, code.toUpperCase().trim());
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as FuelCoupon;
          }
          return null;
        },
        "Verificando cupón..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al verificar cupón", "El cupón no es válido o ha expirado.");
      throw error;
    }
  }

  async saveCoupon(coupon: Partial<FuelCoupon>): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const code = coupon.code!.toUpperCase().trim();
          const docRef = doc(this.firebaseService.firestore, this.collectionName, code);
          
          const data = {
            ...coupon,
            code,
            updatedAt: new Date().toISOString()
          };

          if (!coupon.createdAt) {
            (data as any).createdAt = new Date().toISOString();
            (data as any).timesUsed = 0;
          }

          await setDoc(docRef, data, { merge: true });
        },
        "Guardando cupón..."
      );
      this.errorService.showInfo("Éxito", "El cupón ha sido guardado ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al guardar cupón", "No pudimos guardar el cupón.");
      throw error;
    }
  }

  async deleteCoupon(id: string): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const docRef = doc(this.firebaseService.firestore, this.collectionName, id);
          await deleteDoc(docRef);
        },
        "Eliminando cupón..."
      );
      this.errorService.showInfo("Eliminado", "El cupón ha sido eliminado ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al eliminar cupón", "No pudimos eliminar el cupón.");
      throw error;
    }
  }

  async incrementUsage(id: string): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const docRef = doc(this.firebaseService.firestore, this.collectionName, id);
          await updateDoc(docRef, {
            timesUsed: increment(1)
          });
        },
        "Actualizando cupón..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al actualizar cupón", "No pudimos actualizar el cupón.");
      throw error;
    }
  }
}
