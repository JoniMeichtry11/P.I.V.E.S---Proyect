import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/welcome']);
      return false;
    }

    const isAdmin = await this.adminService.isUserAdmin(user.uid, user.email || undefined);
    if (!isAdmin) {
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
