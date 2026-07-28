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

  async seedDefaultVehicles(): Promise<void> {
    const vehicles = await this.getVehicles();

    if (vehicles.length > 0) {
      throw new Error('La colección de vehículos ya tiene datos.');
    }

    const reference = collection(
      this.firebaseService.firestore,
      this.collectionName
    );

    for (const vehicle of [
      {
        id: 'car1',
        name: 'Buggito',
        image: 'https://i.ibb.co/8DPJkNFJ/buggy-rojo.jpg',
        pricePerSlot: 2
      },
      {
        id: 'car2',
        name: 'Aventurero Azul',
        image: 'https://i.ibb.co/Ld81vLT5/hilux-azul.jpg',
        pricePerSlot: 2
      },
      {
        id: 'car3',
        name: 'Princesa Rosa',
        image: 'https://i.ibb.co/hx8tmcK4/rosado.jpg',
        pricePerSlot: 2
      },
      {
        id: 'car4',
        name: 'Rayo Blanco',
        image: 'https://i.ibb.co/ZRK9Ny1X/mercedes-blanco.jpg',
        pricePerSlot: 2
      }
    ]) {
      await setDoc(doc(reference, vehicle.id), vehicle);
    }
  }
}