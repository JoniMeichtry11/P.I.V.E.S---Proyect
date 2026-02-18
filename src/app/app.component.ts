import { Component, OnInit } from '@angular/core';
import { UserService } from './core/services/user.service';
import { AuthService } from './core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

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
      <main [class.pt-24]="showHeader$ | async" class="transition-opacity duration-500 ease-in-out">
        <router-outlet></router-outlet>
      </main>
    </div>
    `,
  styles: [],
  standalone: false
})
export class AppComponent implements OnInit {
  showHeader$;
  activeChild$;

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
    // Manejar redirecciones basadas en el estado del usuario
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userService.currentUserAccount$.subscribe(account => {
          if (account) {
            const activeIndex = this.userService.getActiveChildIndex();
            const activeChild = this.userService.getActiveChild();
            
            if (activeIndex === null) {
              if (account.children.length > 1) {
                this.router.navigate(['/child-selection']);
              } else if (account.children.length === 1) {
                this.userService.setActiveChildIndex(0);
                const currentUrl = this.router.url;
                if (currentUrl === '/' || currentUrl === '/welcome') {
                  this.router.navigate(['/home']);
                }
              } else {
                this.router.navigate(['/child-selection']);
              }
            } else if (activeChild && !activeChild.hasCompletedOnboarding && this.router.url !== '/onboarding') {
              this.router.navigate(['/onboarding']);
            }
          }
        });
      }
    });
  }
}

