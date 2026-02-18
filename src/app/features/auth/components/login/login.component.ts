import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { Parent, Child } from '@core/models/user.model';
import { AVATARS } from '@core/constants/app.constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  mode: 'login' | 'register' = 'login';
  form: FormGroup;
  children: Array<{ name: string; avatar?: string; gender?: 'male' | 'female' }> = [{ name: '', avatar: undefined, gender: undefined }];
  showVerification = false;
  verificationCode = '';
  pendingAccount: any = null;
  error = '';
  loading = false;
  avatars = AVATARS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      parentName: [''],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'login';
      if (this.mode === 'register') {
        this.form.get('parentName')?.setValidators([Validators.required]);
        this.form.get('phone')?.setValidators([Validators.required]);
      }
    });
  }

  addChild(): void {
    this.children.push({ name: '', avatar: undefined, gender: undefined });
  }

  handleChildDataChange(index: number, field: string, value: any): void {
    this.children[index] = { ...this.children[index], [field]: value };
  }

  async onSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;

    if (this.mode === 'login') {
      try {
        await this.authService.login(this.form.value.email, this.form.value.password);
        this.router.navigate(['/home']);
      } catch (err: any) {
        this.error = err.message || 'Error al iniciar sesión';
      } finally {
        this.loading = false;
      }
    } else {
      // Register
      const isAnyChildFieldEmpty = this.children.some(c => !c.name || !c.avatar || !c.gender);
      if (!this.form.value.parentName || !this.form.value.phone || isAnyChildFieldEmpty) {
        this.error = 'Por favor, completa todos los campos para registrarte.';
        this.loading = false;
        return;
      }

      this.pendingAccount = {
        parent: {
          name: this.form.value.parentName,
          email: this.form.value.email,
          phone: this.form.value.phone,
          password: this.form.value.password
        },
        children: this.children
      };
      this.showVerification = true;
      this.loading = false;
    }
  }

  async handleVerificationSubmit(): Promise<void> {
    if (this.verificationCode === '123456') {
      if (this.pendingAccount) {
        this.loading = true;
        try {
          const user = await this.authService.register(
            this.pendingAccount.parent.email,
            this.pendingAccount.parent.password
          );

          const finalAccount = {
            parent: {
              name: this.pendingAccount.parent.name,
              email: this.pendingAccount.parent.email,
              phone: this.pendingAccount.parent.phone
            },
            children: this.pendingAccount.children.map((child: any) => ({
              ...child,
              id: `${Date.now()}-${Math.random()}`,
              progress: {
                ruedas: 0,
                volantes: 0,
                milestones: [],
                currentCardIndex: 0,
                fuelLiters: 10,
                familyActionsProgress: 0
              },
              bookings: [],
              hasCompletedOnboarding: false,
              accessories: { unlocked: [], equipped: null },
              usedRedeemCodes: []
            }))
          };

          await this.authService.saveUserData(user.uid, finalAccount);
          this.router.navigate(['/home']);
        } catch (err: any) {
          this.error = err.message || 'Error al registrar';
          this.showVerification = false;
        } finally {
          this.loading = false;
        }
      }
    } else {
      this.error = 'El código de verificación no es correcto. Por favor, inténtalo de nuevo.';
    }
  }
}


