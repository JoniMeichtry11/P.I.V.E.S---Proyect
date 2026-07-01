# Feature: Family Actions

## Responsabilidad
Fomentar la conducción segura y el aprendizaje familiar a través de una lista de verificación (checklist) interactiva que los niños completan cuando viajan como acompañantes con sus padres. Cuenta con 16 tarjetas que abordan temas de seguridad (cinturón de seguridad, velocidad, respeto al peatón, giros, etc.). El progreso se guarda en tiempo real y la lista puede imprimirse para jugar fuera de línea.

## Componentes Principales
- **FamilyActionsComponent (`family-actions.component.ts`):** Gestiona la navegación de las 16 tarjetas, el estado de las casillas de verificación (tres por tarjeta) y la acción de impresión de página.

## Servicios
- **UserService (`core/services/user.service.ts`):** Almacena de forma persistente el índice de progreso de la tarjeta en el perfil del niño (`updateFamilyActionsProgress`).

## Stores / Estados
- Consume `UserService.activeChild$` para sincronizar la tarjeta actual donde quedó el niño en su última sesión.

## Rutas
- `/family-actions`: Protegida por `AuthGuard` y `OnboardingGuard`.

## Dependencias
- Constante estática `FAMILY_ACTION_CARDS` (16 tarjetas con 3 consignas cada una).
- Reglas CSS de impresión (`@media print` y clases `.no-print`) en `styles.css` para formatear el reporte impreso.
