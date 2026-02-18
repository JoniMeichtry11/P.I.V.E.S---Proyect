import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.userService.activeChild$.pipe(
      take(1),
      map(child => {
        if (!child) {
          this.router.navigate(['/child-selection']);
          return false;
        }
        
        if (!child.hasCompletedOnboarding) {
          this.router.navigate(['/onboarding']);
          return false;
        }
        
        return true;
      })
    );
  }
}


