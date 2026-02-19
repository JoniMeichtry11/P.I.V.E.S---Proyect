import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './components/map/map.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { SharedModule } from '../../shared/shared.module';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [
    MapComponent,
    EventFormComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    SharedModule,
    GoogleMapsModule
  ]
})
export class MapModule { }
