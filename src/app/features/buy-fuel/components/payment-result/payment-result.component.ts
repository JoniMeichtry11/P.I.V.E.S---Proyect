import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FUEL_PACKAGES } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css'],
  standalone: false
})
export class PaymentResultComponent implements OnInit {
  status: 'approved' | 'failure' | 'pending' | 'verifying' = 'verifying';
  liters = 0;
  paymentId = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'];
      const statusParam = params['status'];
      this.liters = parseInt(params['liters'] || '0', 10);

      if (statusParam === 'approved') {
        this.processApprovedPayment();
      } else if (statusParam === 'failure') {
        this.status = 'failure';
      } else if (statusParam === 'pending') {
        this.status = 'pending';
      } else {
        this.status = 'failure';
        this.errorMessage = 'No se pudo obtener el estado del pago.';
      }
    });
  }

  private async processApprovedPayment(): Promise<void> {
    this.status = 'verifying';
    try {
      if (this.paymentId) {
        // Verificar el pago con la API de MP para seguridad
        const { status: mpStatus } = await this.paymentService.getPaymentStatus(this.paymentId);
        
        if (mpStatus === 'approved') {
          // Acreditar combustible si aún no se hizo (evitar duplicados si es posible, aunque addFuel debería ser robusto)
          if (this.liters > 0) {
            await this.userService.addFuel(this.liters);
            
            // Guardar transacción
            const user = this.authService.getCurrentUser();
            const child = this.userService.getActiveChild();
            if (user && child) {
              const pkg = FUEL_PACKAGES.find(p => p.liters === this.liters);
              await this.paymentService.saveTransaction({
                userId: user.uid,
                childId: child.id,
                packageLiters: this.liters,
                packagePrice: pkg?.price ?? 0,
                mpPaymentId: this.paymentId,
                status: 'approved',
                createdAt: new Date().toISOString()
              });
            }

            // Limpiar descuento
            await this.userService.clearDiscount();
          }
          this.status = 'approved';
        } else if (mpStatus === 'in_process' || mpStatus === 'pending') {
          this.status = 'pending';
        } else {
          this.status = 'failure';
          this.errorMessage = 'El pago fue rechazado por la entidad emisora.';
        }
      } else {
        // Si no hay paymentId pero llegó como approved (raro en producción, posible en tests manuales)
        if (this.liters > 0) {
          await this.userService.addFuel(this.liters);
          this.status = 'approved';
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      this.status = 'failure';
      this.errorMessage = 'Hubo un problema al confirmar tu combustible. Por favor contactanos.';
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goBooking(): void {
    this.router.navigate(['/booking']);
  }

  tryAgain(): void {
    this.router.navigate(['/buy-fuel']);
  }
}
