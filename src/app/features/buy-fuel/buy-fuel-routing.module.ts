import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuyFuelComponent } from './components/buy-fuel/buy-fuel.component';

const routes: Routes = [
  {
    path: '',
    component: BuyFuelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyFuelRoutingModule { }


