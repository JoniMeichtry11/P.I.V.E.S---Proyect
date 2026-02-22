import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FamilyActionsComponent } from './family-actions.component';

const routes: Routes = [
  {
    path: '',
    component: FamilyActionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamilyActionsRoutingModule { }
