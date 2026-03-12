import { Injectable } from "@angular/core";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  deleteUser,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  AuthError,
} from "firebase/auth";
import { FirebaseService } from "./firebase.service";
import { LoadingService } from "./loading.service";
import { ErrorService } from "./error.service";
import { Observable, BehaviorSubject, ReplaySubject } from "rxjs";
import { UserAccount } from "../models/user.model";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Unsubscribe,
  deleteDoc,
} from "firebase/firestore";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new ReplaySubject<User | null>(1);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _currentUser: User | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {
    this.firebaseService.auth.languageCode = "es";
    onAuthStateChanged(this.firebaseService.auth, (user: User | null) => {
      this._currentUser = user;
      this.currentUserSubject.next(user);
    });
  }

  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await this.loadingService.executeWithLoading(
        () => createUserWithEmailAndPassword(
          this.firebaseService.auth,
          email,
          password,
        ),
        "Creando tu cuenta..."
      );
      const user = userCredential.user;
      this._currentUser = user;
      this.currentUserSubject.next(user);
      this.errorService.showInfo("¡Éxito!", "Cuenta creada exitosamente 🎉");
      return user;
    } catch (error) {
      this.errorService.handleError(error, "Error al registrar", "No pudimos crear tu cuenta. Por favor intenta de nuevo.");
      throw this.getFriendlyErrorMessage(error as AuthError);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      this.loadingService.show("Iniciando sesión...");
      const userCredential = await signInWithEmailAndPassword(
        this.firebaseService.auth,
        email,
        password,
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        await this.logout();
        throw new Error(
          "Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico y haz clic en el enlace de confirmación.",
        );
      }

      console.log(user);
      this._currentUser = user;
      this.currentUserSubject.next(user);
      this.errorService.showInfo("¡Bienvenido!", "Has iniciado sesión correctamente 👋");
      // No ocultamos el loading aquí. El app.component.ts lo ocultará al finalizar la redirección.
      return user;
    } catch (error) {
      this.loadingService.hide();
      if (error instanceof Error && error.message?.includes("verificada")) {
        this.errorService.handleError(error, "Email no verificado", error.message);
        throw error;
      }
      this.errorService.handleError(error, "Error al iniciar sesión", "Las credenciales son incorrectas. Por favor intenta de nuevo.");
      throw this.getFriendlyErrorMessage(error as AuthError);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        () => signOut(this.firebaseService.auth),
        "Cerrando sesión..."
      );
      this._currentUser = null;
      this.currentUserSubject.next(null);
      this.errorService.showInfo("Adiós", "Has cerrado sesión 👋");
    } catch (error) {
      this.errorService.handleError(error, "Error al cerrar sesión", "Hubo un problema al cerrar tu sesión.");
    }
  }

  getCurrentUser(): User | null {
    return this._currentUser;
  }

  private getFriendlyErrorMessage(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      "auth/user-not-found":
        "Este usuario no está registrado. Por favor, crea una cuenta nueva para ingresar.",
      "auth/wrong-password":
        "La contraseña es incorrecta. Por favor, inténtalo de nuevo.",
      "auth/email-already-in-use":
        "Este correo electrónico ya está registrado. Intenta iniciar sesión.",
      "auth/weak-password":
        "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.",
    };

    const message =
      errorMessages[error.code] ||
      "Este usuario no se halla en los registros. ¿Deseas registrarte?.";
    return new Error(message);
  }

  subscribeToUserData(
    uid: string,
    callback: (data: UserAccount | null) => void,
  ): Unsubscribe {
    const userRef = doc(this.firebaseService.firestore, "users", uid);
    return onSnapshot(
      userRef,
      (docSnapshot: any) => {
        if (docSnapshot.exists()) {
          callback({ uid, ...docSnapshot.data() } as UserAccount);
        } else {
          callback(null);
        }
      },
      (error: any) => {
        console.error("Error fetching user data:", error);
        callback(null);
      },
    );
  }

  async saveUserData(
    uid: string,
    userData: Omit<UserAccount, "uid">,
  ): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        async () => {
          const userRef = doc(this.firebaseService.firestore, "users", uid);
          await setDoc(userRef, userData);
        },
        "Guardando datos..."
      );
    } catch (error) {
      this.errorService.handleError(error, "Error al guardar datos", "No pudimos guardar tus datos. Por favor intenta de nuevo.");
    }
  }

  async sendEmailVerification(user: User): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        () => sendEmailVerification(user),
        "Enviando email de verificación..."
      );
      this.errorService.showInfo("Email enviado", "Revisa tu correo para verificar tu cuenta 📧");
    } catch (error) {
      this.errorService.handleError(error, "Error al enviar email", "No pudimos enviar el email de verificación. Por favor intenta de nuevo.");
    }
  }

  async deleteAccount(): Promise<void> {
    const user = this.firebaseService.auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado");

    try {
      await this.loadingService.executeWithLoading(async () => {
        // 1. Delete from Firestore
        const userRef = doc(this.firebaseService.firestore, "users", user.uid);
        await deleteDoc(userRef);

        // 2. Delete from Auth
        await deleteUser(user);
      }, "Eliminando tu cuenta...");
      
      this.errorService.showInfo("Cuenta eliminada", "Tu cuenta ha sido eliminada exitosamente 😢");
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        this.errorService.handleError(
          error, 
          "Sesión expirada", 
          "Por seguridad, debes haber iniciado sesión recientemente para realizar esta acción. Por favor, cierra sesión e ingresa de nuevo antes de intentar eliminar tu cuenta."
        );
        throw new Error(
          "Por seguridad, debes haber iniciado sesión recientemente para realizar esta acción. Por favor, cierra sesión e ingresa de nuevo antes de intentar eliminar tu cuenta.",
        );
      }
      this.errorService.handleError(error, "Error al eliminar cuenta", "No pudimos eliminar tu cuenta. Por favor intenta de nuevo.");
      throw error;
    }
  }

  async verifyEmail(oobCode: string): Promise<void> {
    try {
      await this.loadingService.executeWithLoading(
        () => applyActionCode(this.firebaseService.auth, oobCode),
        "Verificando email..."
      );
      this.errorService.showInfo("¡Verificado!", "Tu email ha sido verificado exitosamente 💚");
    } catch (error) {
      this.errorService.handleError(error, "Error al verificar email", "El código de verificación es inválido o ha expirado.");
      throw this.getFriendlyErrorMessage(error as AuthError);
    }
  }
}
