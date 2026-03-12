import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService, LoadingState } from '../../../core/services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {
  loadingState: LoadingState = { isLoading: false, message: '' };
  private destroy$ = new Subject<void>();
  
  // Array de emojis amigables para niños
  friendlyEmojis = ['🚗', '⛽', '🎉', '✨', '🌟', '💫', '🎊'];
  currentEmoji = '🚗';
  emojiIndex = 0;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loadingState = state;
        if (state.isLoading) {
          this.startEmojiAnimation();
        }
      });
  }

  startEmojiAnimation(): void {
    this.emojiIndex = 0;
    this.updateEmoji();
  }

  updateEmoji(): void {
    const interval = setInterval(() => {
      if (!this.loadingState.isLoading) {
        clearInterval(interval);
        return;
      }
      this.emojiIndex = (this.emojiIndex + 1) % this.friendlyEmojis.length;
      this.currentEmoji = this.friendlyEmojis[this.emojiIndex];
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
