import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminCouponsComponent } from './components/admin-coupons/admin-coupons.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminBookingsComponent,
    AdminCouponsComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
