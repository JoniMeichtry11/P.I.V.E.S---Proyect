import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.loadVoices();
    if (this.synth) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;

    const voices = this.synth.getVoices();
    if (voices.length === 0) return;

    // Filtrar todas las voces en español (es-ES, es-MX, es-AR, es-US, etc.)
    const spanishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
    
    if (spanishVoices.length === 0) {
      // Si no hay español, intentar inglés o la primera disponible
      this.selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      return;
    }

    // Prioridad para una voz premium/natural:
    // 1. Voces "Natural" u "Online" (Edge/Azure - suenan excelente)
    // 2. Voces de Google (Chrome - suenan muy bien)
    // 3. Voces locales específicas (preferencia es-ES para España o es-MX/es-AR para Latam)
    // 4. Cualquier voz en español
    
    this.selectedVoice = 
      spanishVoices.find(v => (v.name.includes('Natural') || v.name.includes('Online')) && (v.lang.includes('ES') || v.lang.includes('MX'))) ||
      spanishVoices.find(v => v.name.includes('Natural') || v.name.includes('Online')) ||
      spanishVoices.find(v => v.name.includes('Google') && (v.lang.includes('ES') || v.lang.includes('MX'))) ||
      spanishVoices.find(v => v.name.includes('Google')) ||
      spanishVoices.find(v => v.lang === 'es-ES') ||
      spanishVoices.find(v => v.lang === 'es-MX') ||
      spanishVoices[0];
  }

  speak(texts: SpeechItem[]): void {
    if (!this.synth || this.isSpeakingSubject.value) return;

    this.synth.cancel();
    this.utteranceQueue = [];

    for (const item of texts) {
      const utterance = new SpeechSynthesisUtterance(item.text);
      
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang;
      } else {
        utterance.lang = 'es-ES';
      }

      // Parámetros para un sonido más natural
      utterance.pitch = 1.0; // 0 a 2
      utterance.rate = 0.95;  // Un poquito más lento suele sonar mejor en español
      utterance.volume = 1.0;

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
      if (this.utteranceQueue.length === 0) {
        this.isSpeakingSubject.next(false);
        this.currentlySpeakingIndexSubject.next(null);
      } else {
        // Un pequeño retraso entre oraciones suena más natural
        setTimeout(() => this.playQueue(), 100);
      }
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance error', event);
      this.utteranceQueue = [];
      this.isSpeakingSubject.next(false);
      this.currentlySpeakingIndexSubject.next(null);
    };

    this.synth.speak(utterance);
  }
}


