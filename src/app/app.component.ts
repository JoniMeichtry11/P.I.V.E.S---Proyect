import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from './core/services/user.service';
import { AuthService } from './core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, switchMap, takeUntil, combineLatestWith, startWith } from 'rxjs/operators';
import { Subject, of, BehaviorSubject } from 'rxjs';

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
  private currentUrl$ = new BehaviorSubject<string>('/');

  private readonly ROUTES_WITHOUT_HEADER = [
    '/welcome', '/login', '/register', '/onboarding', '/child-selection'
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.currentUrl$.next(event.urlAfterRedirects || event.url);
    });

    this.showHeader$ = this.userService.activeChild$.pipe(
      combineLatestWith(this.currentUrl$),
      map(([child, url]) => {
        if (!child) return false;
        if (this.ROUTES_WITHOUT_HEADER.some(r => url.startsWith(r))) return false;
        return child.hasCompletedOnboarding;
      })
    );
    this.activeChild$ = this.userService.activeChild$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user && user.emailVerified) {
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


