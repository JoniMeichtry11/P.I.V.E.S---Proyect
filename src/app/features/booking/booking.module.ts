import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BookingRoutingModule } from './booking-routing.module';
import { BookingComponent } from './components/booking/booking.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    BookingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BookingRoutingModule,
    SharedModule
  ]
})
export class BookingModule { }


