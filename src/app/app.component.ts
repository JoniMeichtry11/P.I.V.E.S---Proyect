import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from './core/services/user.service';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { filter, map, switchMap, tap, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-sky-50 text-slate-800">
      @if (showHeader$ | async) {
        <app-header
          [activeChild]="activeChild$ | async"
        ></app-header>
      }
      @if (showHeader$ | async) {
        <app-notification-manager
          [activeChild]="activeChild$ | async"
        ></app-notification-manager>
      }
      @if (showHeader$ | async) {
        <app-breadcrumb></app-breadcrumb>
      }
      <main [class.pt-24]="showHeader$ | async" class="transition-opacity duration-500 ease-in-out">
        <router-outlet></router-outlet>
      </main>
    </div>
    `,
  styles: [],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  showHeader$;
  activeChild$;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.showHeader$ = this.userService.activeChild$.pipe(
      filter(child => child !== null),
      map(child => child?.hasCompletedOnboarding ?? false)
    );
    this.activeChild$ = this.userService.activeChild$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.userService.currentUserAccount$;
        } else {
          return of(null);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(account => {
      if (account) {
        const activeIndex = this.userService.getActiveChildIndex();
        
        if (activeIndex === null && account.children.length === 1) {
          this.userService.setActiveChildIndex(0);
        }
        
        const currentUrl = this.router.url;
        if (currentUrl === '/' || currentUrl === '/welcome' || currentUrl === '/login' || currentUrl === '/register') {
          if (this.userService.getActiveChildIndex() !== null) {
            this.router.navigate(['/home']);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


