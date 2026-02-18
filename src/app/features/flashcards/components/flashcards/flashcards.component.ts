import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { Child, Question, AnswerSummary } from '../../../../core/models/user.model';
import { QUESTIONS, QUESTIONS_PER_CARD, MARA_HAPPY_URL, MARA_THINKING_URL } from '../../../../core/constants/app.constants';
import { Subscription } from 'rxjs';

type ViewMode = 'menu' | 'game' | 'result';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css'],
  standalone: false
})
export class FlashcardsComponent implements OnInit, OnDestroy {
  activeChild: Child | null = null;
  viewMode: ViewMode = 'menu';
  playingCardIndex = 0;
  questionIndex = 0;
  selectedAnswer: number | null = null;
  showFeedback = false;
  isCorrect = false;
  correctAnswersInCard = 0;
  showCardResult = false;
  wasCardSuccessful = false;
  answersSummary: AnswerSummary[] = [];
  shuffledOptions: string[] = [];
  correctShuffledIndex: number | null = null;
  isSpeaking = false;
  currentlySpeakingIndex: number | null = null;
  isSavingProgress = false;
  
  readonly MARA_HAPPY_URL = MARA_HAPPY_URL;
  readonly MARA_THINKING_URL = MARA_THINKING_URL;
  readonly QUESTIONS_PER_CARD = QUESTIONS_PER_CARD;

  private subscriptions = new Subscription();
  readonly TOTAL_CARDS = Math.floor(QUESTIONS.length / QUESTIONS_PER_CARD);
  readonly levels: number[] = Array.from({ length: this.TOTAL_CARDS }, (_, i) => i);

  router: Router;

  constructor(
    private _router: Router,
    private userService: UserService,
    private textToSpeech: TextToSpeechService
  ) {
    this.router = this._router;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.userService.activeChild$.subscribe((child: any) => {
        this.activeChild = child;
        if (child && this.viewMode === 'menu') {
          this.playingCardIndex = child.progress.currentCardIndex;
          this.questionIndex = child.progress.currentCardIndex * QUESTIONS_PER_CARD;
        }
      })
    );

    this.subscriptions.add(
      this.textToSpeech.isSpeaking$.subscribe((isSpeaking: any) => {
        this.isSpeaking = isSpeaking;
      })
    );

    this.subscriptions.add(
      this.textToSpeech.currentlySpeakingIndex$.subscribe((index: any) => {
        this.currentlySpeakingIndex = index;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.textToSpeech.cancel();
  }

  get currentQuestion(): Question | null {
    return QUESTIONS[this.questionIndex] || null;
  }

  get questionInCardIndex(): number {
    return this.questionIndex % QUESTIONS_PER_CARD;
  }

  handleSelectLevel(index: number): void {
    this.playingCardIndex = index;
    this.questionIndex = index * QUESTIONS_PER_CARD;
    this.correctAnswersInCard = 0;
    this.showCardResult = false;
    this.wasCardSuccessful = false;
    this.showFeedback = false;
    this.selectedAnswer = null;
    this.answersSummary = [];
    this.viewMode = 'game';
    this.textToSpeech.cancel();
    this.shuffleOptions();
  }

  shuffleOptions(): void {
    if (!this.currentQuestion) return;
    
    const correctAnswer = this.currentQuestion.options[this.currentQuestion.correctAnswerIndex];
    const shuffled = [...this.currentQuestion.options];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    this.shuffledOptions = shuffled;
    this.correctShuffledIndex = shuffled.indexOf(correctAnswer);
  }

  handleAnswer(answerIndex: number): void {
    if (this.showFeedback) return;
    
    this.textToSpeech.cancel();
    this.selectedAnswer = answerIndex;
    const correct = answerIndex === this.correctShuffledIndex;
    this.isCorrect = correct;
    this.showFeedback = true;

    const summaryItem: AnswerSummary = {
      question: this.currentQuestion!.text,
      userAnswer: this.shuffledOptions[answerIndex],
      correctAnswer: this.currentQuestion!.options[this.currentQuestion!.correctAnswerIndex],
      isCorrect: correct
    };
    this.answersSummary = [...this.answersSummary, summaryItem];

    if (correct) {
      this.correctAnswersInCard++;
    }

    // Reproducir feedback
    if (this.currentQuestion) {
      const feedbackTitle = correct ? '¡Correcto!' : '¡Casi!';
      this.textToSpeech.speak([
        { text: feedbackTitle },
        { text: this.currentQuestion.explanation }
      ]);
    }
  }

  handleNext(): void {
    this.textToSpeech.cancel();
    
    if (this.questionInCardIndex === QUESTIONS_PER_CARD - 1) {
      // Fin de la tarjeta
      const successful = this.correctAnswersInCard === QUESTIONS_PER_CARD;
      this.wasCardSuccessful = successful;
      
      if (successful) {
        this.isSavingProgress = true;
        this.userService.completeLevel(this.playingCardIndex).then(() => {
          this.isSavingProgress = false;
        }).catch(err => {
          console.error("Error saving progress:", err);
          this.isSavingProgress = false;
        });
      }
      
      this.showCardResult = true;
    } else {
      this.showFeedback = false;
      this.selectedAnswer = null;
      this.questionIndex++;
      this.shuffleOptions();
    }
  }

  handleRetryCard(): void {
    this.handleSelectLevel(this.playingCardIndex);
  }

  handleBackToMenu(): void {
    // Ya no es necesario llamar a userService aquí porque ya se guardó en handleNext
    this.textToSpeech.cancel();
    this.viewMode = 'menu';
  }

  handleDirectNextLevel(): void {
    const nextLevelIndex = this.playingCardIndex + 1;
    if (nextLevelIndex < this.TOTAL_CARDS) {
      this.handleSelectLevel(nextLevelIndex);
    } else {
      this.router.navigate(['/booking']);
    }
  }

  handleGoToBooking(): void {
    this.router.navigate(['/booking']);
  }

  handleSpeak(): void {
    if (this.isSpeaking) {
      this.textToSpeech.cancel();
    } else if (this.currentQuestion) {
      const textsToSpeak = [
        { text: this.currentQuestion.text },
        ...this.shuffledOptions.map((option, index) => ({ text: option, index }))
      ];
      this.textToSpeech.speak(textsToSpeak);
    }
  }

  get isLastLevelOfGame(): boolean {
    return this.playingCardIndex === this.TOTAL_CARDS - 1;
  }

  get progressPercentage(): number {
    return ((this.questionInCardIndex) / QUESTIONS_PER_CARD) * 100;
  }
}

