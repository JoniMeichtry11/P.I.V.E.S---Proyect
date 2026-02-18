import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { Child } from '../../../../core/models/user.model';
import { PREPAID_CODES } from '../../../../core/constants/app.constants';
import { Subscription } from 'rxjs';

interface FuelPackage {
  liters: number;
  price: number;
  bonus?: string;
  bgColor: string;
}

interface FeedbackMessage {
  type: 'success' | 'error';
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
  isProcessing = false;
  paymentMethod: 'card' | 'wallet' = 'card';

  private subscriptions = new Subscription();

  readonly FUEL_PACKAGES: FuelPackage[] = [
    { liters: 2, price: 10000, bgColor: 'from-sky-400 to-blue-500' },
    { liters: 5, price: 22500, bonus: '¡10% DTO!', bgColor: 'from-green-400 to-emerald-500' },
    { liters: 10, price: 40000, bonus: '¡20% DTO!', bgColor: 'from-amber-400 to-orange-500' },
    { liters: 20, price: 75000, bonus: '¡El mejor valor!', bgColor: 'from-purple-500 to-indigo-600' },
  ];

  router: Router;

  constructor(
    private _router: Router,
    private userService: UserService
  ) {
    this.router = this._router;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.userService.activeChild$.subscribe(child => {
        this.activeChild = child;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleRedeemCodeSubmit(): void {
    const code = this.redeemCode.toUpperCase().trim();
    const amount = PREPAID_CODES[code];
    const alreadyUsed = (this.activeChild?.usedRedeemCodes || []).includes(code);
    
    if (alreadyUsed) {
      this.feedbackMessage = { type: 'error', text: 'Este código ya ha sido canjeado.' };
    } else if (amount) {
      this.userService.redeemCode(code, amount);
      this.feedbackMessage = { type: 'success', text: `¡Felicidades! Has canjeado ${amount} Litros de Combustible.` };
      this.redeemCode = '';
    } else {
      this.feedbackMessage = { type: 'error', text: 'El código ingresado no es válido.' };
    }
    
    setTimeout(() => this.feedbackMessage = null, 5000);
  }

  handleSelectPackage(pkg: FuelPackage): void {
    this.selectedPackage = pkg;
  }

  handlePaymentSuccess(): void {
    if (!this.selectedPackage) return;
    
    this.userService.addFuel(this.selectedPackage.liters);
    this.purchasedAmount = this.selectedPackage.liters;
    this.selectedPackage = null;
    this.showSuccessModal = true;
  }

  handleFinalizePayment(): void {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.handlePaymentSuccess();
    }, 2500);
  }

  closePaymentModal(): void {
    this.selectedPackage = null;
    this.isProcessing = false;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }
}

