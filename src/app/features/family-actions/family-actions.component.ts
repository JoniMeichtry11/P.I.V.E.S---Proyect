import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { Child, FamilyActionCard } from '../../core/models/user.model';
import { FAMILY_ACTION_CARDS } from '../../core/constants/app.constants';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-family-actions',
  templateUrl: './family-actions.component.html',
  styleUrls: ['./family-actions.component.css'],
  standalone: false,
})
export class FamilyActionsComponent implements OnInit {
  activeChild$: Observable<Child | null>;
  cards: FamilyActionCard[] = FAMILY_ACTION_CARDS;
  currentIndex: number = 0;
  checkboxes: boolean[] = [false, false, false];
  totalCards: number = FAMILY_ACTION_CARDS.length;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.activeChild$ = this.userService.activeChild$;
  }

  ngOnInit(): void {
    this.activeChild$.subscribe(child => {
      if (child) {
        this.currentIndex = child.progress.familyActionsProgress || 0;
      }
    });
  }

  get currentCard(): FamilyActionCard {
    return this.cards[this.currentIndex];
  }

  handleCheckboxChange(index: number): void {
    this.checkboxes[index] = !this.checkboxes[index];
  }

  handlePrev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetCheckboxes();
      this.saveProgress();
    }
  }

  handleNext(): void {
    if (this.currentIndex < this.totalCards - 1) {
      this.currentIndex++;
      this.resetCheckboxes();
      this.saveProgress();
    } else {
      // Finalizar: Resetear progreso y volver a inicio
      this.currentIndex = 0;
      this.saveProgress();
      this.router.navigate(['/home']);
    }
  }

  handlePrint(): void {
    window.print();
  }

  private resetCheckboxes(): void {
    this.checkboxes = [false, false, false];
  }

  private saveProgress(): void {
    this.userService.updateFamilyActionsProgress(this.currentIndex);
  }
}
