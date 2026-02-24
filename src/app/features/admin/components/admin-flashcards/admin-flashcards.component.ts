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
  flashcards: (Question & { id: string, orderIndex?: number })[] = [];
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

  async saveFlashcard(flashcard: Question & { id: string, orderIndex?: number }): Promise<void> {
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

  async handleAddCard(): Promise<void> {
    this.loading = true;
    try {
      let maxOrderIndex = -1;
      this.flashcards.forEach(f => {
        if (f.orderIndex !== undefined && f.orderIndex > maxOrderIndex) {
          maxOrderIndex = f.orderIndex;
        }
      });
      
      const newCardIndex = this.getGroupedFlashcards().length + 1;
      
      for (let i = 0; i < 3; i++) {
        const orderIndex = maxOrderIndex + 1 + i;
        const newQuestion: Question & { orderIndex: number } = {
          image: '',
          text: `Nueva pregunta ${i + 1} para la Tarjeta ${newCardIndex}`,
          options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
          correctAnswerIndex: 0,
          explanation: 'Explicación del admin',
          audience: 'child',
          orderIndex: orderIndex
        };
        await this.flashcardService.addFlashcard(newQuestion);
      }
      
      this.successMessage = 'Nueva tarjeta añadida correctamente.';
      setTimeout(() => this.successMessage = null, 3000);
      await this.loadFlashcards();
    } catch (err) {
      console.error('Error adding new card:', err);
      this.error = 'Error al añadir una nueva tarjeta.';
      this.loading = false; 
    }
  }

  async handleDeleteCard(groupIndex: number): Promise<void> {
    if (!confirm(`¿Seguro que quieres eliminar la TARJETA ${groupIndex}? Se borrarán las 3 preguntas asociadas.`)) return;
    
    this.loading = true;
    try {
      const groups = this.getGroupedFlashcards();
      const groupToDelete = groups.find(g => g.cardIndex === groupIndex);
      if (groupToDelete) {
        for (const question of groupToDelete.questions) {
          await this.flashcardService.deleteFlashcard(question.id);
        }
        this.successMessage = `Tarjeta ${groupIndex} eliminada correctamente.`;
        setTimeout(() => this.successMessage = null, 3000);
        await this.loadFlashcards();
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      this.error = 'Error al eliminar la tarjeta.';
      this.loading = false;
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
