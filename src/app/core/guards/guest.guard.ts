import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

/**
 * Redirects already-authenticated users away from auth routes (login, register, welcome).
 * If the user is logged in and has an active child, goes to /home.
 * If logged in but no child selected, goes to /child-selection.
 * If not logged in, allows the route.
 */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      filter(user => user !== undefined),
      take(1),
      switchMap(user => {
        if (!user || !user.emailVerified) {
          return of(true); // not logged in → allow
        }
        // Logged in → redirect away
        return this.userService.currentUserAccount$.pipe(
          filter(account => account !== undefined),
          take(1),
          map(account => {
            if (!account) {
              return true;
            }
            const idx = this.userService.getActiveChildIndex();
            if (idx !== null) {
              const child = account.children[idx];
              if (child && !child.hasCompletedOnboarding) {
                this.router.navigate(['/onboarding']);
              } else {
                this.router.navigate(['/home']);
              }
            } else if (account.children.length > 1) {
              this.router.navigate(['/child-selection']);
            } else if (account.children.length === 1) {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/home']);
            }
            return false;
          })
        );
      })
    );
  }
}
