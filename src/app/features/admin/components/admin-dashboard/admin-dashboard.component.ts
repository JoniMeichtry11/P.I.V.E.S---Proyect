import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, AdminStats } from '../../../../core/services/admin.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: false
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  loading = true;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.loading = true;
    try {
      this.stats = await this.adminService.getStats();
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    this.loading = false;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/welcome']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
