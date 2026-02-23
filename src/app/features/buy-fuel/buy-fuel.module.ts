import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuyFuelRoutingModule } from './buy-fuel-routing.module';
import { BuyFuelComponent } from './components/buy-fuel/buy-fuel.component';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    BuyFuelComponent,
    PaymentResultComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BuyFuelRoutingModule,
    SharedModule
  ]
})
export class BuyFuelModule { }


