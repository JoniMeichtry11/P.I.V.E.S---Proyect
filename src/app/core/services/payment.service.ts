import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { FuelPackage, FuelTransaction } from '../models/user.model';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface MpPreference {
  id: string;
  init_point: string;       // URL de pago (producción)
  sandbox_init_point: string; // URL de pago (sandbox / test)
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly MP_API = 'https://api.mercadopago.com';
  private readonly IS_PRODUCTION = environment.production;
  private firestore: Firestore;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {
    this.firestore = this.firebaseService.firestore;
  }

  /**
   * Crea una preferencia de pago en MercadoPago y devuelve la URL del checkout.
   * En TEST siempre devuelve la sandbox_init_point; en producción, la init_point.
   */
  async createPreference(pkg: FuelPackage, childId: string): Promise<{ preferenceId: string; checkoutUrl: string }> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado.');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.mercadopago.accessToken}`,
      'Content-Type': 'application/json'
    });

    // URL base de la app (ej: http://localhost:4200 en dev, o https://pives.com.ar en prod)
    const appUrl = window.location.origin;

    const preferenceBody = {
      items: [
        {
          id: `fuel-${pkg.liters}L`,
          title: `P.I.V.E.S. — ${pkg.liters} Litros de Combustible`,
          description: 'Combustible para reservar autos en la plataforma P.I.V.E.S.',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: pkg.price
        }
      ],
      back_urls: {
        success: `${appUrl}/buy-fuel?status=approved&liters=${pkg.liters}&childId=${childId}`,
        failure: `${appUrl}/buy-fuel?status=failure`,
        pending: `${appUrl}/buy-fuel?status=pending&liters=${pkg.liters}&childId=${childId}`
      },
      auto_return: 'approved',
      metadata: {
        user_id: user.uid,
        child_id: childId,
        liters: pkg.liters
      },
      statement_descriptor: 'PIVES',
      external_reference: `${user.uid}_${childId}_${pkg.liters}L_${Date.now()}`
    };

    const response = await firstValueFrom(
      this.http.post<MpPreference>(
        `${this.MP_API}/checkout/preferences`,
        preferenceBody,
        { headers }
      )
    );

    return {
      preferenceId: response.id,
      checkoutUrl: this.IS_PRODUCTION ? response.init_point : response.sandbox_init_point
    };
  }

  /**
   * Verifica el estado de un pago dado su ID (payment_id devuelto por MP en la URL de retorno).
   */
  async getPaymentStatus(paymentId: string): Promise<{ status: string; statusDetail: string }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.mercadopago.accessToken}`
    });

    const response = await firstValueFrom(
      this.http.get<{ status: string; status_detail: string }>(
        `${this.MP_API}/v1/payments/${paymentId}`,
        { headers }
      )
    );

    return { status: response.status, statusDetail: response.status_detail };
  }

  /**
   * Guarda un registro de la transacción en Firestore bajo /users/{uid}/fuelTransactions/{txId}
   */
  async saveTransaction(tx: Omit<FuelTransaction, 'id'>): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const txId = `${Date.now()}-${tx.mpPaymentId}`;
    const txRef = doc(this.firestore, 'users', user.uid, 'fuelTransactions', txId);
    await setDoc(txRef, { ...tx, id: txId });
  }
}
