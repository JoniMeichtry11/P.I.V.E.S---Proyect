import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LandingRoutingModule } from './landing-routing-module';
import { LandingPage } from './components/landing-page/landing-page';

@NgModule({
  declarations: [LandingPage],
  imports: [
    CommonModule,
    RouterModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
