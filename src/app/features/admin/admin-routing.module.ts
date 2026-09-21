import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminVehiclesComponent } from './components/admin-vehicles/admin-vehicles.component';

import { AdminCouponsComponent } from './components/admin-coupons/admin-coupons.component';
import { AdminFlashcardsComponent } from './components/admin-flashcards/admin-flashcards.component';
import { AdminSponsorsComponent } from './components/admin-sponsors/admin-sponsors.component';
import { AdminLandingComponent } from './components/admin-landing/admin-landing.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'users', component: AdminUsersComponent },
  { path: 'bookings', component: AdminBookingsComponent },
  { path: 'coupons', component: AdminCouponsComponent },
  { path: 'flashcards', component: AdminFlashcardsComponent },
  { path: 'sponsors', component: AdminSponsorsComponent },
  { path: 'landing', component: AdminLandingComponent },
  { path: 'vehicles', component: AdminVehiclesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
