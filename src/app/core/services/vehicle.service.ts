import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from 'firebase/firestore';

import { FirebaseService } from './firebase.service';
import { CarModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly collectionName = 'vehicles';

  constructor(private firebaseService: FirebaseService) {}

  async getVehicles(): Promise<CarModel[]> {
    const reference = collection(
      this.firebaseService.firestore,
      this.collectionName
    );

    const snapshot = await getDocs(reference);

    return snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    } as CarModel));
  }

  async addVehicle(vehicle: Omit<CarModel, 'id'>): Promise<void> {
    const reference = collection(
      this.firebaseService.firestore,
      this.collectionName
    );

    const vehicleReference = doc(reference);

    await setDoc(vehicleReference, {
      ...vehicle,
      id: vehicleReference.id
    });
  }

  async updateVehicle(
    id: string,
    vehicle: Omit<CarModel, 'id'>
  ): Promise<void> {
    const reference = doc(
      this.firebaseService.firestore,
      this.collectionName,
      id
    );

    await setDoc(reference, {
      ...vehicle,
      id
    }, { merge: true });
  }

  async deleteVehicle(id: string): Promise<void> {
    const reference = doc(
      this.firebaseService.firestore,
      this.collectionName,
      id
    );

    await deleteDoc(reference);
  }
}