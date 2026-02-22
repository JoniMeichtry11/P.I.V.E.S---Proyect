import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { MARA_HAPPY_URL, MARA_THINKING_URL } from '../../../../core/constants/app.constants';
import { Subscription, firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  standalone: false
})
export class OnboardingComponent implements OnInit, OnDestroy {
  currentStep = 0;
  maraHappy = MARA_HAPPY_URL;
  maraThinking = MARA_THINKING_URL;
  childName = '';
  private sub = new Subscription();

  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.userService.activeChild$.subscribe(child => {
        if (child) {
          this.childName = child.name;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get stepsCount(): number {
    return 7;
  }

  nextStep(): void {
    if (this.isLoading) return;

    if (this.currentStep < this.stepsCount - 1) {
      this.currentStep++;
    } else {
      this.completeOnboarding();
    }
  }

  prevStep(): void {
    if (this.isLoading) return;
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      this.isLoading = true;
      console.log('Finalizando onboarding...');
      
      // Enviamos la actualización a Firestore
      await this.userService.updateActiveChildData({ hasCompletedOnboarding: true });
      
      console.log('Onboarding guardado, esperando a que el estado se sincronice...');
      
      // Esperamos a que la suscripción local detecte el cambio de Firestore
      // Esto evita que el OnboardingGuard nos rebote al intentar navegar
      await firstValueFrom(
        this.userService.activeChild$.pipe(
          filter(child => !!child && child.hasCompletedOnboarding === true),
          take(1)
        )
      );

      console.log('Estado sincronizado, redirigiendo a home...');
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al completar onboarding:', error);
      // Fallback: intentar navegar de todos modos si algo falla tras un tiempo
      this.router.navigate(['/home']);
    } finally {
      this.isLoading = false;
    }
  }
}
