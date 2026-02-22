import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
  standalone: false
})
export class HelpComponent {
  phone = '+54 9 2994 12-2509';
  emailPrimary = 'contacto@pives.com.ar';
  emailSupport = 'no-reply@pives.com.ar';

  get whatsappUrl(): string {
    const cleanPhone = this.phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  }
}
