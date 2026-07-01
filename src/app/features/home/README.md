# Feature: Home

## Responsabilidad
Servir como el panel de control principal (Dashboard) para el niño una vez que ha iniciado sesión y completado el onboarding. Presenta accesos directos interactivos a todas las funcionalidades principales del sistema (juego de flashcards, reserva de coches, mapa de eventos, checklist familiar y perfil) y permite cerrar la sesión familiar.

## Componentes Principales
- **HomeComponent (`components/home/`):** Vista responsiva del dashboard adaptada con tarjetas interactivas animadas (`.interactive-card`).

## Servicios
- **UserService (`core/services/user.service.ts`):** Obtiene la información básica del niño activo.
- **AuthService (`core/services/auth.service.ts`):** Provee el método para cerrar la sesión actual (`logout`).

## Stores / Estados
- Escucha `UserService.activeChild$` para mostrar de forma dinámica los progresos (litros de combustible, ruedas, volantes) directamente en los accesos directos.

## Rutas
- `/home`: Protegida por `AuthGuard` y `OnboardingGuard`.

## Dependencias
- Componentes globales compartidos (`HeaderComponent`, `BreadcrumbComponent`).
