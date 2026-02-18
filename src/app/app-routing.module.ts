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
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Página de Inicio' }
  },
  {
    path: 'flashcards',
    loadChildren: () => import('./features/flashcards/flashcards.module').then(m => m.FlashcardsModule),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Desafío de Señales' }
  },
  {
    path: 'booking',
    loadChildren: () => import('./features/booking/booking.module').then(m => m.BookingModule),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Reservar un Coche' }
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Mi Perfil' }
  },
  {
    path: 'buy-fuel',
    loadChildren: () => import('./features/buy-fuel/buy-fuel.module').then(m => m.BuyFuelModule),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Cargar Combustible' }
  },
  {
    path: 'map',
    loadChildren: () => import('./features/map/map.module').then(m => m.MapModule),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Mapa de Eventos' }
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


