import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlashcardsComponent } from './components/flashcards/flashcards.component';

const routes: Routes = [
  {
    path: '',
    component: FlashcardsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlashcardsRoutingModule { }


