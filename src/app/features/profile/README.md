# Feature: Profile

## Responsabilidad
Mostrar el perfil del niño con sus estadísticas acumuladas (litros, ruedas y volantes) y proveer una tienda virtual gamificada. En esta tienda, los niños gastan sus "Ruedas" (moneda ganada respondiendo trivias) para comprar y equipar accesorios visuales en sus avatares (sombreros, coronas, gafas, etc.). También ofrece a los padres una sección de configuración para eliminar la cuenta familiar permanentemente.

## Componentes Principales
- **ProfileComponent (`components/profile/`):** Renderiza el perfil, la grilla interactiva de la tienda con estados (comprado, equipado, precio, comprar) y el diálogo de confirmación para eliminar la cuenta.

## Servicios
- **UserService (`core/services/user.service.ts`):** Deduce el precio en ruedas y desbloquea accesorios (`updateActiveChildData`), gestiona el equipamiento y procesa la eliminación completa de datos (`deleteAccount`).

## Stores / Estados
- Escucha `UserService.activeChild$` para reaccionar al cambio de monedas virtuales y accesorios equipados del avatar del niño.

## Rutas
- `/profile`: Protegida por `AuthGuard` y `OnboardingGuard`.

## Dependencias
- Constante estática `ACCESSORIES` (listado de artículos de la tienda con ID, nombre, emoji y precio).
