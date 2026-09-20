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
      const friendlyError = this.getFriendlyErrorMessage(error as AuthError);
      this.errorService.handleError(friendlyError, "Error al registrar", friendlyError.message);
      throw friendlyError;
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
      const friendlyError = this.getFriendlyErrorMessage(error as AuthError);
      this.errorService.handleError(friendlyError, "Error al iniciar sesión", friendlyError.message);
      throw friendlyError;
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
    let code = error?.code;
    const rawMessage = typeof error === 'string' ? error : (error?.message || '');

    if (!code && typeof rawMessage === 'string') {
      const match = rawMessage.match(/auth\/[a-z-]+/i);
      if (match) {
        code = match[0];
      }
    }

    const errorMessages: Record<string, string> = {
      "auth/invalid-credential":
        "El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus datos e inténtalo de nuevo.",
      "auth/user-not-found":
        "No encontramos ninguna cuenta registrada con este correo electrónico.",
      "auth/wrong-password":
        "La contraseña ingresada es incorrecta. Por favor, inténtalo de nuevo.",
      "auth/invalid-email":
        "El correo electrónico ingresado no tiene un formato válido.",
      "auth/email-already-in-use":
        "Este correo electrónico ya está registrado. Intenta iniciar sesión.",
      "auth/weak-password":
        "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.",
      "auth/user-disabled":
        "Esta cuenta ha sido deshabilitada. Por favor, contacta con soporte.",
      "auth/too-many-requests":
        "Demasiados intentos fallidos. Por seguridad, por favor intenta más tarde.",
      "auth/network-request-failed":
        "Error de conexión. Por favor, verifica tu conexión a internet.",
      "auth/requires-recent-login":
        "Por seguridad, debes haber iniciado sesión recientemente para realizar esta acción.",
      "auth/expired-action-code":
        "El enlace de verificación ha expirado. Por favor solicita uno nuevo.",
      "auth/invalid-action-code":
        "El enlace de verificación es inválido o ya ha sido utilizado.",
    };

    const message =
      (code && errorMessages[code]) ||
      (error instanceof Error && !error.message?.startsWith('Firebase:')
        ? error.message
        : "Error al iniciar sesión. Verifica tu usuario y contraseña.");

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
