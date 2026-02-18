import { Injectable } from '@angular/core';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged,
  deleteUser,
  sendEmailVerification,
  AuthError
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { UserAccount } from '../models/user.model';
import { doc, setDoc, getDoc, onSnapshot, Unsubscribe, deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new ReplaySubject<User | null>(1);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _currentUser: User | null = null;

  constructor(private firebaseService: FirebaseService) {
    this.firebaseService.auth.languageCode = 'es';
    onAuthStateChanged(this.firebaseService.auth, (user: User | null) => {
      this._currentUser = user;
      this.currentUserSubject.next(user);
    });
  }

  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseService.auth,
        email,
        password
      );
      const user = userCredential.user;
      this._currentUser = user;
      this.currentUserSubject.next(user);
      return user;
    } catch (error) {
      throw this.getFriendlyErrorMessage(error as AuthError);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.firebaseService.auth,
        email,
        password
      );
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        await this.logout();
        throw new Error('Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico y haz clic en el enlace de confirmación.');
      }

      console.log(user);
      this._currentUser = user;
      this.currentUserSubject.next(user);
      return user;
    } catch (error) {
      if (error instanceof Error && error.message.includes('verificada')) {
        throw error;
      }
      throw this.getFriendlyErrorMessage(error as AuthError);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.firebaseService.auth);
    this._currentUser = null;
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this._currentUser;
  }

  private getFriendlyErrorMessage(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Este usuario no está registrado. Por favor, crea una cuenta nueva para ingresar.',
      'auth/wrong-password': 'La contraseña es incorrecta. Por favor, inténtalo de nuevo.',
      'auth/email-already-in-use': 'Este correo electrónico ya está registrado. Intenta iniciar sesión.',
      'auth/weak-password': 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.',
    };
    
    const message = errorMessages[error.code] || 'Este usuario no se halla en los registros. ¿Deseas registrarte?.';
    return new Error(message);
  }

  subscribeToUserData(uid: string, callback: (data: UserAccount | null) => void): Unsubscribe {
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    return onSnapshot(userRef, (docSnapshot: any) => {
      if (docSnapshot.exists()) {
        callback({ uid, ...docSnapshot.data() } as UserAccount);
      } else {
        callback(null);
      }
    }, (error: any) => {
      console.error('Error fetching user data:', error);
      callback(null);
    });
  }

  async saveUserData(uid: string, userData: Omit<UserAccount, 'uid'>): Promise<void> {
    const userRef = doc(this.firebaseService.firestore, 'users', uid);
    await setDoc(userRef, userData);
  }

  async sendEmailVerification(user: User): Promise<void> {
    await sendEmailVerification(user);
  }
  
  async deleteAccount(): Promise<void> {
    const user = this.firebaseService.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      // 1. Delete from Firestore
      const userRef = doc(this.firebaseService.firestore, 'users', user.uid);
      await deleteDoc(userRef);

      // 2. Delete from Auth
      await deleteUser(user);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Por seguridad, debes haber iniciado sesión recientemente para realizar esta acción. Por favor, cierra sesión e ingresa de nuevo antes de intentar eliminar tu cuenta.');
      }
      throw error;
    }
  }
}


