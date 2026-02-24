import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashcardService } from '../../../../core/services/flashcard.service';
import { Question } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-flashcards',
  templateUrl: './admin-flashcards.component.html',
  styleUrls: ['./admin-flashcards.component.css'],
  standalone: false
})
export class AdminFlashcardsComponent implements OnInit {
  flashcards: (Question & { id: string })[] = [];
  loading = true;
  savingId: string | null = null;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private flashcardService: FlashcardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFlashcards();
  }

  async loadFlashcards(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.flashcards = await this.flashcardService.getFlashcards();
    } catch (err) {
      console.error('Error loading flashcards:', err);
      this.error = 'Error al cargar las flashcards.';
    } finally {
      this.loading = false;
    }
  }

  async handleMigrate(): Promise<void> {
    if (!confirm('¿Seguro que quieres migrar los datos iniciales? Esto solo funcionará si la base de datos está vacía.')) return;
    
    this.loading = true;
    try {
      await this.flashcardService.migrateHardcodedData();
      await this.loadFlashcards();
      this.successMessage = 'Migración completada con éxito.';
      setTimeout(() => this.successMessage = null, 3000);
    } catch (err) {
      console.error('Migration error:', err);
      this.error = 'Error durante la migración.';
    } finally {
      this.loading = false;
    }
  }

  async saveFlashcard(flashcard: Question & { id: string }): Promise<void> {
    this.savingId = flashcard.id;
    try {
      const { id, ...data } = flashcard;
      await this.flashcardService.updateFlashcard(id, data);
      this.successMessage = 'Flashcard actualizada correctamente.';
      setTimeout(() => this.successMessage = null, 3000);
    } catch (err) {
      console.error('Error saving flashcard:', err);
      this.error = 'Error al guardar los cambios.';
    } finally {
      this.savingId = null;
    }
  }

  getGroupedFlashcards() {
    const groups = [];
    for (let i = 0; i < this.flashcards.length; i += 3) {
      groups.push({
        cardIndex: Math.floor(i / 3) + 1,
        questions: this.flashcards.slice(i, i + 3)
      });
    }
    return groups;
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
