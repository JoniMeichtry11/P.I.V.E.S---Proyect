import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyActionsRoutingModule } from './family-actions-routing.module';
import { FamilyActionsComponent } from './family-actions.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    FamilyActionsComponent
  ],
  imports: [
    CommonModule,
    FamilyActionsRoutingModule,
    FormsModule
  ]
})
export class FamilyActionsModule { }
