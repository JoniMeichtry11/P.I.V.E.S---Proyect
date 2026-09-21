import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LoadingService } from './loading.service';
import { ErrorService } from './error.service';
import { LandingConfig, DEFAULT_LANDING_CONFIG } from '../models/landing.model';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LandingConfigService {
  private readonly documentPath = 'config/landing';
  
  private configSubject = new BehaviorSubject<LandingConfig>(DEFAULT_LANDING_CONFIG);
  public config$: Observable<LandingConfig> = this.configSubject.asObservable();

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {
    this.listenToConfigChanges();
  }

  /**
   * Listen to real-time changes in the landing configuration.
   */
  private listenToConfigChanges(): void {
    const docRef = doc(this.firebaseService.firestore, this.documentPath);
    onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        this.configSubject.next(snapshot.data() as LandingConfig);
      } else {
        // If it doesn't exist, use default
        this.configSubject.next(DEFAULT_LANDING_CONFIG);
      }
    }, (error) => {
      console.error("Error listening to landing config:", error);
    });
  }

  /**
   * Gets the current configuration snapshot
   */
  public getConfig(): LandingConfig {
    return this.configSubject.getValue();
  }

  /**
   * Updates the landing configuration in Firestore
   */
  async updateConfig(newConfig: LandingConfig): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const docRef = doc(this.firebaseService.firestore, this.documentPath);
          await setDoc(docRef, newConfig, { merge: true });
        },
        "Guardando configuración..."
      );
      this.errorService.showInfo("Guardado", "La configuración se ha guardado correctamente ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al guardar", "No pudimos guardar la configuración de la landing.");
      throw error;
    }
  }
}
