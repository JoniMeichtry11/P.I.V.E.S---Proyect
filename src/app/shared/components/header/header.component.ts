import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Child, Accessory, UserAccount } from '../../../core/models/user.model';
import { ACCESSORIES, MILESTONES_ORDER, MILESTONE_DATA } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false
})
export class HeaderComponent {
  @Input() set activeChild(value: Child | null) {
    this._activeChild = value;
    this._updateMilestones();
  }
  get activeChild(): Child | null { return this._activeChild; }
  @Input() isAdmin = false;

  private _activeChild: Child | null = null;
  cachedMilestones: Array<{name: string; icon: string; isUnlocked: boolean}> = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  get equippedAccessory(): Accessory | undefined {
    if (!this.activeChild?.accessories?.equipped) return undefined;
    return ACCESSORIES.find(acc => acc.id === this.activeChild!.accessories.equipped);
  }

  private _updateMilestones(): void {
    this.cachedMilestones = MILESTONES_ORDER.map(key => ({
      ...MILESTONE_DATA[key],
      isUnlocked: (this._activeChild?.progress?.milestones || []).includes(key)
    }));
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  switchProfile(): void {
    this.userService.setActiveChildIndex(null);
    this.router.navigate(['/child-selection']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}


