import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { MARA_HAPPY_URL, MARA_THINKING_URL } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  standalone: false
})
export class OnboardingComponent implements OnInit {
  currentStep = 0;
  maraHappy = MARA_HAPPY_URL;
  maraThinking = MARA_THINKING_URL;

  steps = [
    {
      title: '¡Bienvenido a PIVES!',
      description: 'Hola, soy Mara. Estoy aquí para enseñarte cómo convertirte en un experto conductor y obtener tu licencia.',
      image: this.maraHappy
    },
    {
      title: 'Desafío de Señales',
      description: 'Aprende las señales de tránsito completando tarjetas artísticas. ¡Ganarás Ruedas y Volantes para avanzar!',
      image: this.maraThinking
    },
    {
      title: 'Reserva tu Coche',
      description: 'Cuando tengas suficientes logros, podrás reservar increíbles coches a batería para practicar en el circuito.',
      image: this.maraHappy
    },
    {
      title: 'Carga Combustible',
      description: 'Para usar los coches necesitarás Litros de combustible. ¡No olvides recargar cuando te quedes sin nada!',
      image: this.maraThinking
    },
    {
      title: 'Tu Progreso',
      description: 'En tu perfil podrás ver todas tus medallas, licencias y personalizar tu avatar.',
      image: this.maraHappy
    }
  ];

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.completeOnboarding();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  async completeOnboarding(): Promise<void> {
    await this.userService.updateActiveChildData({ hasCompletedOnboarding: true });
    this.router.navigate(['/home']);
  }
}
