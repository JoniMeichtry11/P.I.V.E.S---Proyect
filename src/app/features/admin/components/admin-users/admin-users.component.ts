import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { UserAccount, Child } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  standalone: false
})
export class AdminUsersComponent implements OnInit {
  users: UserAccount[] = [];
  loading = true;
  expandedUserId: string | null = null;
  fuelAmounts: Record<string, number> = {};

  // Modal de confirmación
  confirmModal = {
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  };

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading = true;
    try {
      this.users = await this.adminService.getAllUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    }
    this.loading = false;
  }

  toggleExpand(uid: string): void {
    this.expandedUserId = this.expandedUserId === uid ? null : uid;
  }

  isExpanded(uid: string): boolean {
    return this.expandedUserId === uid;
  }

  getTotalBookings(user: UserAccount): number {
    return (user.children || []).reduce((sum, child) =>
      sum + (child.bookings || []).length, 0);
  }

  getActiveBookings(user: UserAccount): number {
    return (user.children || []).reduce((sum, child) =>
      sum + (child.bookings || []).filter(b => b.status === 'active').length, 0);
  }

  getTotalFuel(user: UserAccount): number {
    return (user.children || []).reduce((sum, child) =>
      sum + (child.progress?.fuelLiters || 0), 0);
  }

  getFuelInputKey(uid: string, childId: string): string {
    return `${uid}_${childId}`;
  }

  getFuelAmount(uid: string, childId: string): number {
    return this.fuelAmounts[this.getFuelInputKey(uid, childId)] || 0;
  }

  setFuelAmount(uid: string, childId: string, value: number): void {
    this.fuelAmounts[this.getFuelInputKey(uid, childId)] = value;
  }

  async addFuel(uid: string, childId: string): Promise<void> {
    const amount = this.getFuelAmount(uid, childId);
    if (!amount || amount <= 0) return;

    await this.adminService.addFuelToChild(uid, childId, amount);
    this.fuelAmounts[this.getFuelInputKey(uid, childId)] = 0;
    await this.loadUsers();
  }

  confirmDeleteUser(user: UserAccount): void {
    this.confirmModal = {
      isOpen: true,
      title: '⚠️ Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar al usuario "${user.parent?.name || user.parent?.email}"? Esta acción eliminará todos sus datos de Firestore y NO se puede deshacer.`,
      action: async () => {
        await this.adminService.deleteUser(user.uid);
        this.confirmModal.isOpen = false;
        await this.loadUsers();
      }
    };
  }

  closeConfirmModal(): void {
    this.confirmModal.isOpen = false;
  }

  async toggleAdminRole(user: UserAccount): Promise<void> {
    const newStatus = !user.isAdmin;
    await this.adminService.toggleAdminRole(user.uid, newStatus);
    await this.loadUsers();
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
