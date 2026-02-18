import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChildSelectionComponent } from './components/child-selection/child-selection.component';

const routes: Routes = [
  {
    path: '',
    component: ChildSelectionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChildSelectionRoutingModule { }
