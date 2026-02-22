import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
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

  constructor(private firebaseService: FirebaseService) {}

  async getCoupons(): Promise<FuelCoupon[]> {
    const couponsRef = collection(this.firebaseService.firestore, this.collectionName);
    const snapshot = await getDocs(couponsRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FuelCoupon));
  }

  async getCouponByCode(code: string): Promise<FuelCoupon | null> {
    const docRef = doc(this.firebaseService.firestore, this.collectionName, code.toUpperCase().trim());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FuelCoupon;
    }
    return null;
  }

  async saveCoupon(coupon: Partial<FuelCoupon>): Promise<void> {
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
  }

  async deleteCoupon(id: string): Promise<void> {
    const docRef = doc(this.firebaseService.firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async incrementUsage(id: string): Promise<void> {
    const docRef = doc(this.firebaseService.firestore, this.collectionName, id);
    await updateDoc(docRef, {
      timesUsed: increment(1)
    });
  }
}
