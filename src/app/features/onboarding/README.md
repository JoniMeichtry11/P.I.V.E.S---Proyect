# Feature: Onboarding

## Responsabilidad
Presentar una guía de aprendizaje interactiva de 7 pasos guiada por el personaje "Mara". Este tutorial introduce al niño en las reglas de seguridad vial de la pista y el funcionamiento básico de la aplicación (monedas, combustible y reservas). Una vez finalizado, se marca la propiedad `hasCompletedOnboarding` en `true` para liberar el acceso a las demás secciones del sistema.

## Componentes Principales
- **OnboardingComponent (`components/onboarding/`):** Estructura del carrusel interactivo de pasos del tutorial con animaciones CSS y validaciones.

## Servicios
- **UserService (`core/services/user.service.ts`):** Registra la finalización del tutorial en la base de datos (`updateActiveChildData`).

## Stores / Estados
- Consume `UserService.activeChild$` para personalizar la bienvenida con el nombre del niño y esperar la sincronización reactiva de Firestore antes de redireccionar.

## Rutas
- `/onboarding`: Protegida por `AuthGuard`.

## Dependencias
- Constantes de recursos (`MARA_HAPPY_URL` y `MARA_THINKING_URL`).
- Operadores de RxJS (`filter`, `take`, `firstValueFrom`) para sincronizar el estado asíncrono de Firestore antes de la navegación.
