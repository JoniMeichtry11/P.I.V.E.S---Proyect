import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { OnboardingGuard } from './core/guards/onboarding.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/welcome',
    pathMatch: 'full'
  },
  /*
  {
    path: 'child-selection',
    loadChildren: () => import('./features/child-selection/child-selection.module').then(m => m.ChildSelectionModule),
    canActivate: [AuthGuard]
  },
  */
  /*
  {
    path: 'onboarding',
    loadChildren: () => import('./features/onboarding/onboarding.module').then(m => m.OnboardingModule),
    canActivate: [AuthGuard]
  },
  */
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'flashcards',
    loadChildren: () => import('./features/flashcards/flashcards.module').then(m => m.FlashcardsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'booking',
    loadChildren: () => import('./features/booking/booking.module').then(m => m.BookingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'buy-fuel',
    loadChildren: () => import('./features/buy-fuel/buy-fuel.module').then(m => m.BuyFuelModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'map',
    loadChildren: () => import('./features/map/map.module').then(m => m.MapModule),
    canActivate: [AuthGuard]
  },
  /*
  {
    path: 'family-actions',
    loadChildren: () => import('./features/family-actions/family-actions.module').then(m => m.FamilyActionsModule),
    canActivate: [AuthGuard, OnboardingGuard]
  },
  */
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: '/welcome'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


