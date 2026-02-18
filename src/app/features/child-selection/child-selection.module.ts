import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildSelectionRoutingModule } from './child-selection-routing.module';
import { ChildSelectionComponent } from './components/child-selection/child-selection.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ChildSelectionComponent
  ],
  imports: [
    CommonModule,
    ChildSelectionRoutingModule,
    SharedModule
  ]
})
export class ChildSelectionModule { }
