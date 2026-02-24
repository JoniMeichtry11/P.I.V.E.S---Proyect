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
import { Question } from '../models/user.model';
import { QUESTIONS } from '../constants/questions.data';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private collectionName = 'flashcards';

  constructor(private firebaseService: FirebaseService) {}

  private get firestore(): Firestore {
    return this.firebaseService.firestore;
  }

  async getFlashcards(): Promise<(Question & { id: string })[]> {
    const flashcardsCol = collection(this.firestore, this.collectionName);
    const q = query(flashcardsCol, orderBy('orderIndex', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Question & { id: string }));
  }

  async updateFlashcard(id: string, data: Partial<Question>): Promise<void> {
    const flashcardDoc = doc(this.firestore, this.collectionName, id);
    await updateDoc(flashcardDoc, data as any);
  }

  async addFlashcard(data: Question & { orderIndex: number }): Promise<string> {
    const flashcardsCol = collection(this.firestore, this.collectionName);
    const newDocRef = doc(flashcardsCol);
    await setDoc(newDocRef, data);
    return newDocRef.id;
  }

  async deleteFlashcard(id: string): Promise<void> {
    const flashcardDoc = doc(this.firestore, this.collectionName, id);
    await deleteDoc(flashcardDoc);
  }

  async migrateHardcodedData(): Promise<void> {
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
  }
}
