import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CouponService } from '../../../../core/services/coupon.service';
import { FuelCoupon } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-coupons',
  templateUrl: './admin-coupons.component.html',
  styleUrls: ['./admin-coupons.component.css'],
  standalone: false
})
export class AdminCouponsComponent implements OnInit {
  coupons: FuelCoupon[] = [];
  loading = true;
  showForm = false;
  editingCoupon: Partial<FuelCoupon> | null = null;
  
  // Form model
  couponForm: Partial<FuelCoupon> = {
    code: '',
    description: '',
    type: 'liters',
    value: 0,
    maxUses: null,
    expiresAt: null
  };

  constructor(
    private couponService: CouponService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCoupons();
  }

  async loadCoupons(): Promise<void> {
    this.loading = true;
    try {
      this.coupons = await this.couponService.getCoupons();
      // Sort by creation date or code
      this.coupons.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
    this.loading = false;
  }

  openNewForm(): void {
    this.editingCoupon = null;
    this.couponForm = {
      code: '',
      description: '',
      type: 'liters',
      value: 0,
      maxUses: null,
      expiresAt: null
    };
    this.showForm = true;
  }

  editCoupon(coupon: FuelCoupon): void {
    this.editingCoupon = coupon;
    this.couponForm = { ...coupon };
    this.showForm = true;
  }

  async saveCoupon(): Promise<void> {
    if (!this.couponForm.code || this.couponForm.value === undefined || this.couponForm.value === null) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      await this.couponService.saveCoupon(this.couponForm);
      this.showForm = false;
      await this.loadCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Error al guardar el cupón.');
    }
  }

  async deleteCoupon(id: string): Promise<void> {
    if (!confirm('¿Estás seguro de que querés eliminar este cupón?')) return;
    
    try {
      await this.couponService.deleteCoupon(id);
      await this.loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
