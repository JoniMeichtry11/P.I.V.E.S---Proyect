import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  public auth: Auth;
  public firestore: Firestore;
  private _storage: any = null;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }

  async getStorage(): Promise<any> {
    if (!this._storage) {
      const { getStorage } = await import('firebase/storage');
      this._storage = getStorage(this.app);
    }
    return this._storage;
  }
}




