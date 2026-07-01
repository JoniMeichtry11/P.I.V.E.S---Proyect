import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LoadingService } from './loading.service';
import { ErrorService } from './error.service';
import { Sponsor } from '../models/user.model';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class SponsorService {
  private readonly collectionName = 'sponsors';

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {}

  /**
   * Obtiene todos los sponsors de Firestore.
   */
  async getSponsors(): Promise<Sponsor[]> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const sponsorsRef = collection(this.firebaseService.firestore, this.collectionName);
          const snapshot = await getDocs(sponsorsRef);
          const sponsors = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor));
          sponsors.sort((a, b) => a.order - b.order);
          return sponsors;
        },
        "Cargando sponsors..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar sponsors", "No pudimos cargar los sponsors.");
      throw error;
    }
  }

  /**
   * Obtiene los sponsors activos, ordenados por su campo `order`.
   * No usa LoadingService porque se llama desde la landing pública sin UI de admin.
   */
  async getActiveSponsors(): Promise<Sponsor[]> {
    try {
      const sponsorsRef = collection(this.firebaseService.firestore, this.collectionName);
      const snapshot = await getDocs(sponsorsRef);
      const sponsors = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Sponsor))
        .filter(s => s.isActive)
        .sort((a, b) => a.order - b.order);
      return sponsors;
    } catch (error) {
      console.error('Error loading active sponsors:', error);
      return [];
    }
  }

  /**
   * Crea o actualiza un sponsor en Firestore.
   */
  async saveSponsor(sponsor: Partial<Sponsor>): Promise<string> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const sponsorsRef = collection(this.firebaseService.firestore, this.collectionName);
          let docRef;

          if (sponsor.id) {
            docRef = doc(this.firebaseService.firestore, this.collectionName, sponsor.id);
          } else {
            docRef = doc(sponsorsRef);
          }

          const data = {
            ...sponsor,
            id: docRef.id
          };

          if (!sponsor.createdAt) {
            data.createdAt = new Date().toISOString();
          }

          await setDoc(docRef, data, { merge: true });
          return docRef.id;
        },
        "Guardando sponsor..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al guardar sponsor", "No pudimos guardar el sponsor.");
      throw error;
    }
  }

  /**
   * Elimina un sponsor de Firestore.
   */
  async deleteSponsor(id: string): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const docRef = doc(this.firebaseService.firestore, this.collectionName, id);
          await deleteDoc(docRef);
        },
        "Eliminando sponsor..."
      );
      this.errorService.showInfo("Eliminado", "El sponsor ha sido eliminado ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al eliminar sponsor", "No pudimos eliminar el sponsor.");
      throw error;
    }
  }

  /**
   * Alterna el estado activo/inactivo de un sponsor.
   */
  async toggleActive(id: string, isActive: boolean): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const docRef = doc(this.firebaseService.firestore, this.collectionName, id);
          await setDoc(docRef, { isActive }, { merge: true });
        },
        isActive ? "Activando sponsor..." : "Desactivando sponsor..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al actualizar sponsor", "No pudimos actualizar el estado.");
      throw error;
    }
  }
}
