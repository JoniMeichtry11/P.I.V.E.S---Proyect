import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashcardsRoutingModule } from './flashcards-routing.module';
import { FlashcardsComponent } from './components/flashcards/flashcards.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    FlashcardsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlashcardsRoutingModule,
    SharedModule
  ]
})
export class FlashcardsModule { }


