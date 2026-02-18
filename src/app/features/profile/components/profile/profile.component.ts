import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { Child, Accessory } from '../../../../core/models/user.model';
import { ACCESSORIES } from '../../../../core/constants/app.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeChild: Child | null = null;
  isDeleteModalOpen = false;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.userService.activeChild$.subscribe(child => {
        this.activeChild = child;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get accessories(): Accessory[] {
    return ACCESSORIES;
  }

  get equippedAccessory(): Accessory | undefined {
    if (!this.activeChild?.accessories?.equipped) return undefined;
    return ACCESSORIES.find(acc => acc.id === this.activeChild?.accessories?.equipped);
  }

  get ruedas(): number {
    return this.activeChild?.progress.ruedas || 0;
  }

  get volantes(): number {
    return this.activeChild?.progress.volantes || 0;
  }

  get fuelLiters(): number {
    return this.activeChild?.progress.fuelLiters || 0;
  }

  handlePurchase(item: Accessory): void {
    if (!this.activeChild) return;
    
    if (this.ruedas >= item.price) {
      const currentAccessories = this.activeChild.accessories || { unlocked: [], equipped: null };
      const newUnlocked = [...(currentAccessories.unlocked || []), item.id];
      
      this.userService.updateActiveChildData({
        progress: {
          ...this.activeChild.progress,
          ruedas: this.ruedas - item.price
        },
        accessories: {
          ...currentAccessories,
          unlocked: newUnlocked
        }
      });
    } else {
      alert('¡Necesitas más ruedas para este accesorio!');
    }
  }

  handleEquip(item: Accessory): void {
    if (!this.activeChild) return;
    
    const currentAccessories = this.activeChild.accessories || { unlocked: [], equipped: null };
    const isEquipped = currentAccessories.equipped === item.id;
    
    this.userService.updateActiveChildData({
      accessories: {
        ...currentAccessories,
        equipped: isEquipped ? null : item.id
      }
    });
  }

  isUnlocked(accessoryId: string): boolean {
    return (this.activeChild?.accessories?.unlocked || []).includes(accessoryId);
  }

  isEquipped(accessoryId: string): boolean {
    return this.activeChild?.accessories?.equipped === accessoryId;
  }

  canAfford(price: number): boolean {
    return this.ruedas >= price;
  }

  confirmDeleteAccount(): void {
    this.isDeleteModalOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
  }

  async executeDeleteAccount(): Promise<void> {
    try {
      await this.userService.deleteAccount();
      // El guard de auth se encargará de redirigir si el usuario ya no existe
      this.router.navigate(['/welcome']);
    } catch (error: any) {
      alert(error.message || 'Error al eliminar la cuenta');
      this.isDeleteModalOpen = false;
    }
  }
}


