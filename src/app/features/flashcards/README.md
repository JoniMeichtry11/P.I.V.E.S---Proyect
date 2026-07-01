# Feature: Flashcards

## Responsabilidad
Implementar el juego interactivo de desafíos y aprendizaje de señales de tránsito. Los niños resuelven cuestionarios de opción múltiple organizados en niveles. Responder correctamente todas las preguntas de un nivel otorga recompensas en monedas virtuales ("Ruedas"), avanzando su progreso hacia la obtención de hitos de conducción (Licencia, Seguro, Tarjeta Verde). Cuenta con soporte de accesibilidad por voz (Text-To-Speech) para lectura de preguntas y explicaciones.

## Componentes Principales
- **FlashcardsComponent (`components/flashcards/`):** Gestiona la lógica de la trivia, barajado de opciones, estados de retroalimentación de "Mara" (correcto/incorrecto) y actualización de progreso.

## Servicios
- **FlashcardService (`core/services/flashcard.service.ts`):** Obtiene y administra los cuestionarios almacenados en Firestore.
- **UserService (`core/services/user.service.ts`):** Registra la aprobación de niveles (`completeLevel`) otorgando recompensas.
- **TextToSpeechService (`core/services/text-to-speech.service.ts`):** Lector de pantalla integrado configurado para pronunciación en español argentino (`es-AR`).

## Stores / Estados
- Consume `UserService.activeChild$` para ajustar el nivel inicial y guardar progresos.
- Escucha `TextToSpeechService.isSpeaking$` y `currentlySpeakingIndex$` para resaltar visualmente la respuesta que se está leyendo en tiempo real.

## Rutas
- `/flashcards`: Protegida por `AuthGuard` y `OnboardingGuard`.

## Dependencias
- Web Speech API nativa del navegador (SpeechSynthesis).
- Constante local de fallback `QUESTIONS` (en caso de base de datos vacía).
