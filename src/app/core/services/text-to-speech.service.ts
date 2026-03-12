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
    
    // Cargar voces inmediatamente
    this.loadVoices();
    
    // Escuchar cambios en las voces disponibles
    if (this.synth) {
      this.synth.onvoiceschanged = () => {
        console.log('Voces disponibles han cambiado, reactivando...');
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;

    const voices = this.synth.getVoices();
    if (voices.length === 0) {
      console.warn('No hay voces TTS disponibles en este dispositivo');
      return;
    }

    // Prioridad 1: Buscar específicamente voces con código es-AR (exacto)
    const argentineVoicesExact = voices.filter(v => 
      v.lang.toLowerCase() === 'es-ar' || 
      v.lang.toLowerCase() === 'es_ar'
    );
    
    // Prioridad 2: Buscar voces que contengan 'ar' y empiecen con 'es'
    const argentineVoicesPartial = voices.filter(v => 
      v.lang.toLowerCase().startsWith('es') && 
      v.lang.toLowerCase().includes('ar')
    );
    
    // Prioridad 3: Buscar cualquier voz en español como fallback
    const spanishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
    
    // Intentar seleccionar en orden de preferencia
    if (argentineVoicesExact.length > 0) {
      this.selectedVoice = this.selectBestVoice(argentineVoicesExact);
      console.log(`✓ Voz es-AR exacta seleccionada: ${this.selectedVoice?.name}`);
    } else if (argentineVoicesPartial.length > 0) {
      this.selectedVoice = this.selectBestVoice(argentineVoicesPartial);
      console.log(`✓ Voz es-AR parcial seleccionada: ${this.selectedVoice?.name}`);
    } else if (spanishVoices.length > 0) {
      this.selectedVoice = this.selectBestVoice(spanishVoices);
      console.log(`⚠ Voz en español (no es-AR) seleccionada: ${this.selectedVoice?.name}`);
    } else {
      // Fallback final: usar cualquier voz disponible
      this.selectedVoice = voices[0] || null;
      console.log(`⚠ Voz del sistema seleccionada (no es español): ${this.selectedVoice?.name}`);
    }
  }

  private selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice {
    // Priorizar voces naturales/de calidad alta
    const preferredPatterns = [
      'natural',
      'neural',
      'online',
      'google',
      'premium'
    ];

    for (const pattern of preferredPatterns) {
      const match = voices.find(v => v.name.toLowerCase().includes(pattern));
      if (match) return match;
    }

    // Si no hay voces preferidas, usar la primera disponible
    return voices[0];
  }

  speak(texts: SpeechItem[]): void {
    if (!this.synth || this.isSpeakingSubject.value) return;

    this.synth.cancel();
    this.utteranceQueue = [];

    for (const item of texts) {
      const utterance = new SpeechSynthesisUtterance(item.text);
      
      // Forzar expresamente el idioma a español argentino
      utterance.lang = 'es-AR';
      
      // Asegurar que se use la voz seleccionada
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      // Parámetros para un sonido más natural y consistente
      utterance.pitch = 1.0; // 0 a 2
      utterance.rate = 0.95; // Velocidad consistente
      utterance.volume = 1.0; // Volumen máximo

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


