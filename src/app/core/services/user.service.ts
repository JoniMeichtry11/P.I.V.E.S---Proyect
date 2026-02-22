import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, ReplaySubject } from 'rxjs';
import { UserAccount, Child, Progress, Booking } from '../models/user.model';
import { AuthService } from './auth.service';
import { MILESTONES_ORDER } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserAccountSubject = new ReplaySubject<UserAccount | null>(1);
  public currentUserAccount$ = this.currentUserAccountSubject.asObservable();
  private _currentAccount: UserAccount | null = null;

  private activeChildIndexSubject = new BehaviorSubject<number | null>(null);
  public activeChildIndex$ = this.activeChildIndexSubject.asObservable();

  public activeChild$: Observable<Child | null> = combineLatest([
    this.currentUserAccount$,
    this.activeChildIndex$
  ]).pipe(
    map(([account, index]: [UserAccount | null, number | null]) => {
      if (account && index !== null && account.children[index]) {
        return account.children[index];
      }
      return null;
    })
  );

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.authService.subscribeToUserData(user.uid, (data: UserAccount | null) => {
          const migratedData = data ? this.migrateUserData(data) : null;
          this._currentAccount = migratedData;
          this.currentUserAccountSubject.next(migratedData);
          
          if (migratedData) {
            // Auto-select if only one child and none selected
            if (this.activeChildIndexSubject.value === null && migratedData.children.length === 1) {
              this.activeChildIndexSubject.next(0);
            }
          }
        });
      } else {
        this._currentAccount = null;
        this.currentUserAccountSubject.next(null);
        this.activeChildIndexSubject.next(null);
      }
    });
  }

  getCurrentUserAccount(): UserAccount | null {
    return this._currentAccount;
  }

  getActiveChild(): Child | null {
    const account = this.getCurrentUserAccount();
    const index = this.activeChildIndexSubject.value;
    if (account && index !== null && account.children[index]) {
      return account.children[index];
    }
    return null;
  }

  setActiveChildIndex(index: number | null): void {
    this.activeChildIndexSubject.next(index);
  }

  getActiveChildIndex(): number | null {
    return this.activeChildIndexSubject.value;
  }

  async updateActiveChildData(partialData: Partial<Child>): Promise<void> {
    const child = this.getActiveChild();
    if (!child) {
      console.warn('UserService: No se pudo actualizar los datos porque no hay un niño activo seleccionado.');
      return;
    }

    console.log('UserService: Actualizando datos del niño activo...', partialData);
    await this.updateActiveChild(partialData);
  }

  async updateUserAccount(account: UserAccount): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const { uid, ...dataToSave } = account;
    await this.authService.saveUserData(user.uid, dataToSave);
  }

  async updateActiveChild(childData: Partial<Child>): Promise<void> {
    const account = this.getCurrentUserAccount();
    const index = this.activeChildIndexSubject.value;
    
    if (!account || index === null) {
      console.warn('UserService: No se pudo actualizar el niño. Cuenta o indice nulo.', { account: !!account, index });
      return;
    }

    const updatedChildren = [...account.children];
    updatedChildren[index] = { ...updatedChildren[index], ...childData };
    
    console.log('UserService: Guardando cambios en Firestore para el niño en el índice:', index);
    await this.updateUserAccount({ ...account, children: updatedChildren });
  }

  async addChild(childData: Omit<Child, 'id' | 'progress' | 'bookings' | 'hasCompletedOnboarding' | 'accessories' | 'usedRedeemCodes'>): Promise<void> {
    const account = this.getCurrentUserAccount();
    if (!account) return;

    const newChild: Child = {
      ...childData,
      id: `${Date.now()}-${Math.random()}`,
      progress: {
        ruedas: 0,
        volantes: 0,
        milestones: [],
        currentCardIndex: 0,
        fuelLiters: 10,
        familyActionsProgress: 0
      },
      bookings: [],
      hasCompletedOnboarding: false,
      accessories: { unlocked: [], equipped: null },
      usedRedeemCodes: []
    };

    const updatedAccount = {
      ...account,
      children: [...account.children, newChild]
    };

    await this.updateUserAccount(updatedAccount);
  }

  async completeLevel(levelIndex: number): Promise<void> {
    const child = this.getActiveChild();
    if (!child) return;

    // Solo avanzamos el progreso real si el niño está completando su nivel actual más alto
    const isAdvancingGlobalProgress = levelIndex === child.progress.currentCardIndex;
    
    let { ruedas, volantes, milestones, currentCardIndex, ...restProgress } = child.progress;
    
    // 1. Lógica de Recompensas (Ruedas/Volantes)
    ruedas += 1;
    if (ruedas >= 4) {
      ruedas = 0;
      volantes += 1;
    }
    if (volantes >= 4) {
      volantes = 0;
      const nextMilestone = MILESTONES_ORDER[milestones.length];
      if (nextMilestone) {
        milestones = [...milestones, nextMilestone];
      }
    }

    // 2. Lógica de Avance de Nivel
    if (isAdvancingGlobalProgress) {
      currentCardIndex += 1;
    }

    // 3. Persistencia única
    await this.updateActiveChild({
      progress: { 
        ...restProgress, 
        ruedas, 
        volantes, 
        milestones, 
        currentCardIndex 
      }
    });

    console.log(`Progreso sincronizado en Firestore: Nivel ${currentCardIndex}, Ruedas ${ruedas}`);
  }

  async updateFamilyActionsProgress(index: number): Promise<void> {
    const child = this.getActiveChild();
    if (!child) return;

    await this.updateActiveChild({
      progress: {
        ...child.progress,
        familyActionsProgress: index
      }
    });
  }

  async advanceCardIndex(): Promise<void> {
    const child = this.getActiveChild();
    if (!child) return;

    await this.updateActiveChild({
      progress: {
        ...child.progress,
        currentCardIndex: child.progress.currentCardIndex + 1
      }
    });
  }

  async addBooking(bookingDetails: Omit<Booking, 'id' | 'status' | 'remindersSent'>): Promise<boolean> {
    const child = this.getActiveChild();
    if (!child) return false;

    if (child.progress.fuelLiters < bookingDetails.car.pricePerSlot) {
      return false;
    }

    const newBooking: Booking = {
      ...bookingDetails,
      id: Date.now().toString(),
      status: 'active',
      remindersSent: { dayBefore: false, sameDay: false }
    };

    await this.updateActiveChild({
      bookings: [...child.bookings, newBooking],
      progress: {
        ...child.progress,
        fuelLiters: child.progress.fuelLiters - bookingDetails.car.pricePerSlot
      }
    });

    return true;
  }

  /**
   * Crea una reserva para un hijo específico (usado cuando el hijo activo tiene conflicto de horario
   * y el adulto decide reservar para un hermano/a).
   */
  async addBookingForChild(childId: string, bookingDetails: Omit<Booking, 'id' | 'status' | 'remindersSent'>): Promise<boolean> {
    const account = this.getCurrentUserAccount();
    if (!account) return false;

    const targetIndex = account.children.findIndex(c => c.id === childId);
    if (targetIndex === -1) return false;

    const targetChild = account.children[targetIndex];
    if (targetChild.progress.fuelLiters < bookingDetails.car.pricePerSlot) {
      return false;
    }

    const newBooking: Booking = {
      ...bookingDetails,
      id: Date.now().toString(),
      status: 'active',
      remindersSent: { dayBefore: false, sameDay: false }
    };

    const updatedChildren = [...account.children];
    updatedChildren[targetIndex] = {
      ...targetChild,
      bookings: [...(targetChild.bookings || []), newBooking],
      progress: {
        ...targetChild.progress,
        fuelLiters: targetChild.progress.fuelLiters - bookingDetails.car.pricePerSlot
      }
    };

    await this.updateUserAccount({ ...account, children: updatedChildren });
    return true;
  }

  async cancelBooking(bookingId: string, childId?: string): Promise<void> {
    const account = this.getCurrentUserAccount();
    if (!account) return;

    // Si no se provee childId, buscamos en el niño activo
    const targetChildId = childId || this.getActiveChild()?.id;
    if (!targetChildId) return;

    const childIndex = account.children.findIndex(c => c.id === targetChildId);
    if (childIndex === -1) return;

    const child = account.children[childIndex];
    const booking = child.bookings.find(b => b.id === bookingId);
    if (!booking || booking.status === 'cancelled') return;

    const updatedBookings = child.bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );

    const updatedChildren = [...account.children];
    updatedChildren[childIndex] = {
      ...child,
      bookings: updatedBookings,
      progress: {
        ...child.progress,
        fuelLiters: child.progress.fuelLiters + booking.car.pricePerSlot
      }
    };

    await this.updateUserAccount({ ...account, children: updatedChildren });
  }

  async addFuel(amount: number): Promise<void> {
    const child = this.getActiveChild();
    if (!child) return;

    await this.updateActiveChild({
      progress: {
        ...child.progress,
        fuelLiters: child.progress.fuelLiters + amount
      }
    });
  }

  async redeemCode(code: string, amount: number, type: 'liters' | 'discount' = 'liters'): Promise<void> {
    const child = this.getActiveChild();
    if (!child) return;

    const usedCodes = child.usedRedeemCodes || [];
    if (usedCodes.includes(code)) {
      throw new Error('Este código ya ha sido canjeado.');
    }

    const progress = { ...child.progress };
    if (type === 'liters') {
      progress.fuelLiters += amount;
    } else {
      progress.activeDiscount = amount;
    }

    await this.updateActiveChild({
      usedRedeemCodes: [...usedCodes, code],
      progress
    });
  }

  async applyDiscount(percentage: number): Promise<void> {
    const child = this.getActiveChild();
    if (!child) return;

    await this.updateActiveChild({
      progress: {
        ...child.progress,
        activeDiscount: percentage
      }
    });
  }

  async clearDiscount(): Promise<void> {
    const child = this.getActiveChild();
    if (!child) return;

    const progress = { ...child.progress };
    delete progress.activeDiscount;

    await this.updateActiveChild({ progress });
  }


  async deleteAccount(): Promise<void> {
    await this.authService.deleteAccount();
  }

  private migrateUserData(data: UserAccount): UserAccount {
    return {
      ...data,
      children: (data.children || []).map(child => {
        const { progress, accessories, ...rest } = child;
        return {
          ...rest,
          id: child.id || `${Date.now()}-${Math.random()}`,
          progress: {
            ruedas: progress?.ruedas ?? 0,
            volantes: progress?.volantes ?? 0,
            milestones: progress?.milestones ?? [],
            currentCardIndex: progress?.currentCardIndex ?? 0,
            fuelLiters: progress?.fuelLiters ?? 0,
            familyActionsProgress: progress?.familyActionsProgress ?? 0,
            activeDiscount: progress?.activeDiscount ?? 0
          },
          bookings: child.bookings || [],
          hasCompletedOnboarding: child.hasCompletedOnboarding || false,
          accessories: {
            unlocked: accessories?.unlocked ?? [],
            equipped: accessories?.equipped ?? null
          },
          usedRedeemCodes: child.usedRedeemCodes || []
        };
      })
    };
  }
}

