import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BuyFuelComponent } from "./components/buy-fuel/buy-fuel.component";
import { PaymentResultComponent } from "./components/payment-result/payment-result.component";

import { OnboardingGuard } from "../../core/guards/onboarding.guard";

const routes: Routes = [
  {
    path: "",
    component: BuyFuelComponent,
    canActivate: [OnboardingGuard],
  },
  {
    path: "status",
    component: PaymentResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyFuelRoutingModule {}
