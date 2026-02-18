import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { Child } from '../models/user.model';

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
      filter((child): child is Child => child !== null),
      take(1),
      map(child => {
        if (!child.hasCompletedOnboarding) {
          this.router.navigate(['/onboarding']);
          return false;
        }
        return true;
      })
    );
  }
}
