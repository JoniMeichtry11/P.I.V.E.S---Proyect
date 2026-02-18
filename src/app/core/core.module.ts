import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    FirebaseService,
    AuthService,
    UserService
  ]
})
export class CoreModule { }


