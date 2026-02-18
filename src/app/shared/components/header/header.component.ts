import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Child, Accessory } from '../../../core/models/user.model';
import { ACCESSORIES, MILESTONES_ORDER, MILESTONE_DATA } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false
})
export class HeaderComponent {
  @Input() activeChild: Child | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  get equippedAccessory(): Accessory | undefined {
    if (!this.activeChild?.accessories?.equipped) return undefined;
    return ACCESSORIES.find(acc => acc.id === this.activeChild!.accessories.equipped);
  }

  get milestones() {
    return MILESTONES_ORDER.map(key => ({
      ...MILESTONE_DATA[key],
      isUnlocked: (this.activeChild?.progress.milestones || []).includes(key)
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
}


