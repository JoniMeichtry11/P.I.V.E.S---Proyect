import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface SpeechItem {
  text: string;
  index?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private isSpeakingSubject = new BehaviorSubject<boolean>(false);
  public isSpeaking$ = this.isSpeakingSubject.asObservable();

  private currentlySpeakingIndexSubject = new BehaviorSubject<number | null>(null);
  public currentlySpeakingIndex$ = this.currentlySpeakingIndexSubject.asObservable();

  private synth: SpeechSynthesis | null;
  private utteranceQueue: SpeechSynthesisUtterance[] = [];

  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  speak(texts: SpeechItem[]): void {
    if (!this.synth || this.isSpeakingSubject.value) return;

    this.synth.cancel();
    this.utteranceQueue = [];

    for (const item of texts) {
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'es-ES';
      (utterance as any)._customIndex = item.index;
      this.utteranceQueue.push(utterance);
    }

    this.playQueue();
  }

  cancel(): void {
    if (!this.synth) return;
    this.utteranceQueue = [];
    this.synth.cancel();
    this.isSpeakingSubject.next(false);
    this.currentlySpeakingIndexSubject.next(null);
  }

  private playQueue(): void {
    if (!this.synth || this.utteranceQueue.length === 0) {
      this.isSpeakingSubject.next(false);
      this.currentlySpeakingIndexSubject.next(null);
      return;
    }

    this.isSpeakingSubject.next(true);
    const utterance = this.utteranceQueue.shift();
    
    if (!utterance) return;

    const index = (utterance as any)._customIndex;
    
    utterance.onstart = () => {
      if (index !== undefined) {
        this.currentlySpeakingIndexSubject.next(index);
      }
    };

    utterance.onend = () => {
      this.playQueue();
    };

    utterance.onerror = () => {
      this.utteranceQueue = [];
      this.isSpeakingSubject.next(false);
      this.currentlySpeakingIndexSubject.next(null);
    };

    this.synth.speak(utterance);
  }
}


