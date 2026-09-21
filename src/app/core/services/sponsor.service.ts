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
  private readonly cacheKey = 'pives_active_sponsors';

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
   * Obtiene los sponsors activos con estrategia stale-while-revalidate.
   * Si hay caché, los devuelve inmediatamente y revalida en background.
   * Si los datos cambiaron en Firestore, invoca el callback `onUpdate`.
   */
  async getActiveSponsors(onUpdate?: (sponsors: Sponsor[]) => void): Promise<Sponsor[]> {
    const cached = this.getCachedActiveSponsors();

    if (cached) {
      // Revalidar en background
      this.fetchActiveFromFirestore().then(fresh => {
        if (fresh && !this.isEqual(cached, fresh)) {
          this.saveToCache(fresh);
          onUpdate?.(fresh);
        }
      }).catch(err => {
        console.warn('Error revalidating active sponsors from Firestore:', err);
      });
      return cached;
    }

    // Sin caché: esperar Firestore
    try {
      const sponsors = await this.fetchActiveFromFirestore();
      if (sponsors) {
        this.saveToCache(sponsors);
        return sponsors;
      }
      return [];
    } catch (error) {
      console.error('Error loading active sponsors:', error);
      return [];
    }
  }

  /**
   * Busca sponsors activos directamente en Firestore.
   */
  private async fetchActiveFromFirestore(): Promise<Sponsor[]> {
    const sponsorsRef = collection(this.firebaseService.firestore, this.collectionName);
    const snapshot = await getDocs(sponsorsRef);
    return snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as Sponsor))
      .filter(s => s.isActive)
      .sort((a, b) => a.order - b.order);
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
          this.invalidateCache();
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
          this.invalidateCache();
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
          this.invalidateCache();
        },
        isActive ? "Activando sponsor..." : "Desactivando sponsor..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al actualizar sponsor", "No pudimos actualizar el estado.");
      throw error;
    }
  }

  /**
   * Lee los sponsors cacheados del localStorage de forma sincrónica.
   * Útil para hidratar la UI antes del primer render y evitar el spinner.
   */
  getCachedActiveSponsors(): Sponsor[] | null {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return null;
      return JSON.parse(raw) as Sponsor[];
    } catch {
      return null;
    }
  }

  /**
   * Guarda los sponsors activos en localStorage.
   */
  private saveToCache(sponsors: Sponsor[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(sponsors));
    } catch {
      // localStorage lleno o no disponible, no es crítico
    }
  }

  /**
   * Invalida el caché de sponsors activos (usado tras operaciones de admin).
   */
  private invalidateCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
    } catch {
      // No es crítico
    }
  }

  /**
   * Compara dos arreglos de sponsors para detectar cambios.
   */
  private isEqual(a: Sponsor[], b: Sponsor[]): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
