import { Injectable } from '@angular/core';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc, 
  Firestore, 
  query, 
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { LoadingService } from './loading.service';
import { ErrorService } from './error.service';
import { Question } from '../models/user.model';
import { QUESTIONS } from '../constants/questions.data';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private collectionName = 'flashcards';

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {}

  private get firestore(): Firestore {
    return this.firebaseService.firestore;
  }

  async getFlashcards(): Promise<(Question & { id: string })[]> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const flashcardsCol = collection(this.firestore, this.collectionName);
          const q = query(flashcardsCol, orderBy('orderIndex', 'asc'));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as Question & { id: string }));
        },
        "Cargando tarjetas..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al cargar tarjetas", "No pudimos cargar las tarjetas.");
      throw error;
    }
  }

  async updateFlashcard(id: string, data: Partial<Question>): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const flashcardDoc = doc(this.firestore, this.collectionName, id);
          await updateDoc(flashcardDoc, data as any);
        },
        "Actualizando tarjeta..."
      );
      this.errorService.showInfo("Éxito", "La tarjeta ha sido actualizada ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al actualizar tarjeta", "No pudimos actualizar la tarjeta.");
      throw error;
    }
  }

  async addFlashcard(data: Question & { orderIndex: number }): Promise<string> {
    try {
      return await this.loadingService.executeWithLoading(
        async () => {
          const flashcardsCol = collection(this.firestore, this.collectionName);
          const newDocRef = doc(flashcardsCol);
          await setDoc(newDocRef, data);
          return newDocRef.id;
        },
        "Creando tarjeta..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al crear tarjeta", "No pudimos crear la tarjeta.");
      throw error;
    }
  }

  async deleteFlashcard(id: string): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const flashcardDoc = doc(this.firestore, this.collectionName, id);
          await deleteDoc(flashcardDoc);
        },
        "Eliminando tarjeta..."
      );
      this.errorService.showInfo("Eliminada", "La tarjeta ha sido eliminada ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error al eliminar tarjeta", "No pudimos eliminar la tarjeta.");
      throw error;
    }
  }

  async migrateHardcodedData(): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const flashcardsCol = collection(this.firestore, this.collectionName);
          const snapshot = await getDocs(flashcardsCol);
          
          // Si ya hay datos, no migramos para evitar duplicados accidentales
          if (snapshot.size > 0) return;

          for (let i = 0; i < QUESTIONS.length; i++) {
              const question = QUESTIONS[i];
              const id = `q_${i + 1}`;
              const flashcardDoc = doc(this.firestore, this.collectionName, id);
              await setDoc(flashcardDoc, {
                  ...question,
                  orderIndex: i
              });
          }
        },
        "Migrando tarjetas..."
      );
      this.errorService.showInfo("Migración completada", "Las tarjetas han sido migradas ✅");
    } catch (error) {
      this.errorService.handleError(error, "Error en migración", "No pudimos migrar las tarjetas.");
      throw error;
    }
  }
}
