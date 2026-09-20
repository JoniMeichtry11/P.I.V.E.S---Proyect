import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminCouponsComponent } from './components/admin-coupons/admin-coupons.component';
import { AdminFlashcardsComponent } from './components/admin-flashcards/admin-flashcards.component';
import { AdminSponsorsComponent } from './components/admin-sponsors/admin-sponsors.component';
import { AdminVehiclesComponent } from './components/admin-vehicles/admin-vehicles.component';
import { AdminLandingComponent } from './components/admin-landing/admin-landing.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminBookingsComponent,
    AdminCouponsComponent,
    AdminFlashcardsComponent,
    AdminSponsorsComponent,
    AdminVehiclesComponent,
    AdminLandingComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
