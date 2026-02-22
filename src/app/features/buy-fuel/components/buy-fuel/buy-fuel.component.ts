import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { Child, FuelPackage } from '../../../../core/models/user.model';
import { PREPAID_CODES, FUEL_PACKAGES } from '../../../../core/constants/app.constants';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { CouponService } from '../../../../core/services/coupon.service';

interface FeedbackMessage {
  type: 'success' | 'error' | 'pending';
  text: string;
}

@Component({
  selector: 'app-buy-fuel',
  templateUrl: './buy-fuel.component.html',
  styleUrls: ['./buy-fuel.component.css'],
  standalone: false
})
export class BuyFuelComponent implements OnInit, OnDestroy {
  activeChild: Child | null = null;
  redeemCode = '';
  feedbackMessage: FeedbackMessage | null = null;
  selectedPackage: FuelPackage | null = null;
  showSuccessModal = false;
  purchasedAmount = 0;
  /** Cuando es true se está creando la preferencia de pago en MP */
  isCreatingPreference = false;
  /** Cuando es true se está verificando el pago que regresó de MP */
  isVerifyingPayment = false;
  /** Cuando es true se está validando un cupón */
  isValidatingCoupon = false;
  paymentMethod: 'card' | 'wallet' = 'card';

  private subscriptions = new Subscription();

  readonly FUEL_PACKAGES: FuelPackage[] = FUEL_PACKAGES;

  router: Router;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private couponService: CouponService
  ) {
    this.router = this._router;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.userService.activeChild$.subscribe(child => {
        this.activeChild = child;
      })
    );

    // Manejar el retorno desde MercadoPago
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        if (params['status']) {
          this.handlePaymentReturn(params);
          // Limpiar los query params de la URL sin recargar
          this.router.navigate([], { replaceUrl: true, queryParams: {} });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private async handlePaymentReturn(params: Record<string, string>): Promise<void> {
    const status = params['status'];
    const paymentId = params['payment_id'];
    const liters = parseInt(params['liters'] || '0', 10);

    if (status === 'approved' && liters > 0) {
      this.isVerifyingPayment = true;
      try {
        // Verificar el pago con la API de MP para evitar manipulación de URL
        if (paymentId) {
          const { status: mpStatus } = await this.paymentService.getPaymentStatus(paymentId);
          if (mpStatus !== 'approved') {
            this.showFeedback('error', 'El pago no pudo ser confirmado. Contactanos si el dinero fue descontado.');
            return;
          }
        }

        await this.userService.addFuel(liters);

        const user = this.authService.getCurrentUser();
        const child = this.userService.getActiveChild();
        if (user && child && paymentId) {
          const pkg = FUEL_PACKAGES.find(p => p.liters === liters);
          await this.paymentService.saveTransaction({
            userId: user.uid,
            childId: child.id,
            packageLiters: liters,
            packagePrice: pkg?.price ?? 0,
            mpPaymentId: paymentId,
            status: 'approved',
            createdAt: new Date().toISOString()
          });
        }
        
        // Limpiar descuento si el pago fue aprobado
        if (this.activeChild?.progress?.activeDiscount) {
          await this.userService.clearDiscount();
        }

        this.purchasedAmount = liters;
        this.showSuccessModal = true;
      } catch (err) {
        console.error('Error al confirmar el pago:', err);
        this.showFeedback('error', 'Hubo un error al acreditar el combustible. Por favor contactanos.');
      } finally {
        this.isVerifyingPayment = false;
      }
    } else if (status === 'failure') {
      this.showFeedback('error', 'El pago fue rechazado. Por favor intentá con otro medio de pago.');
    } else if (status === 'pending') {
      this.showFeedback('pending', 'Tu pago está siendo procesado. Los litros se acreditarán en breve.');
    }
  }

  async handleRedeemCodeSubmit(): Promise<void> {
    if (!this.redeemCode.trim()) return;
    
    const code = this.redeemCode.toUpperCase().trim();
    const alreadyUsed = (this.activeChild?.usedRedeemCodes || []).includes(code);

    if (alreadyUsed) {
      this.showFeedback('error', 'Este código ya ha sido canjeado.');
      return;
    }

    this.isValidatingCoupon = true;
    try {
      const coupon = await this.couponService.getCouponByCode(code);
      
      if (!coupon) {
        this.showFeedback('error', 'El código ingresado no es válido.');
        return;
      }

      // Validar expiración
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        this.showFeedback('error', 'Este cupón ha expirado.');
        return;
      }

      // Validar límite de usos
      if (coupon.maxUses !== null && coupon.timesUsed >= coupon.maxUses) {
        this.showFeedback('error', 'Este cupón ha alcanzado su límite de usos.');
        return;
      }

      // Canjear
      await this.userService.redeemCode(code, coupon.value, coupon.type);
      await this.couponService.incrementUsage(code);
      
      const benefitText = coupon.type === 'liters' 
        ? `${coupon.value} Litros de Combustible`
        : `${coupon.value}% de Descuento para tu próxima compra`;

      this.showFeedback('success', `¡Felicidades! Has canjeado: ${benefitText}. ${coupon.description}`);
      this.redeemCode = '';
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      this.showFeedback('error', 'Hubo un error al procesar el cupón. Intentá más tarde.');
    } finally {
      this.isValidatingCoupon = false;
    }
  }

  handleSelectPackage(pkg: FuelPackage): void {
    this.selectedPackage = pkg;
    this.paymentMethod = 'card';
  }

  /** Redirige al checkout de MercadoPago */
  async handleFinalizePayment(): Promise<void> {
    if (!this.selectedPackage) return;
    const child = this.userService.getActiveChild();
    if (!child) {
      this.showFeedback('error', 'No hay un niño seleccionado. Por favor volvé al inicio.');
      return;
    }

    this.isCreatingPreference = true;
    try {
      const price = this.calculateDiscountedPrice(this.selectedPackage.price);
      const pkgWithDiscount = { ...this.selectedPackage, price };

      const { checkoutUrl } = await this.paymentService.createPreference(
        pkgWithDiscount,
        child.id
      );
      // Redirigir al checkout de MP (sale de la app)
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Error al crear la preferencia:', err);
      const errorMsg = err?.error?.message || 'No se pudo conectar con MercadoPago. Verificá tu conexión.';
      this.showFeedback('error', errorMsg);
      this.selectedPackage = null;
    } finally {
      this.isCreatingPreference = false;
    }
  }

  closePaymentModal(): void {
    this.selectedPackage = null;
    this.isCreatingPreference = false;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  calculateDiscountedPrice(originalPrice: number): number {
    const discount = this.activeChild?.progress?.activeDiscount || 0;
    if (discount <= 0) return originalPrice;
    return Math.round(originalPrice * (1 - discount / 100));
  }

  private showFeedback(type: 'success' | 'error' | 'pending', text: string): void {
    this.feedbackMessage = { type, text };
    setTimeout(() => this.feedbackMessage = null, 7000);
  }
}
