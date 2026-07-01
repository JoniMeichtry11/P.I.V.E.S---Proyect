# Feature: Map

## Responsabilidad
Mostrar un mapa interactivo con la ubicación de eventos viales, prácticas de conducción en pistas, presentaciones escolares y competencias del Programa P.I.V.E.S. en Buenos Aires. Si el usuario logueado posee rol administrativo (Admin), habilita controles avanzados para añadir, modificar o eliminar eventos directamente en el mapa dibujando rutas opcionales (líneas poligonales).

## Componentes Principales
- **MapComponent (`components/map/`):** Contenedor principal de Google Maps. Inicializa y centra el mapa, genera marcadores dinámicos con emojis representativos según categoría (`🏎️`, `🎉`, `📚`, `🏆`) mediante inyección SVG, y dibuja rutas.
- **EventFormComponent (`components/event-form/`):** Formulario para la creación o modificación de eventos (Título, Categoría, Descripción, Fecha, Hora, Coordenadas y puntos de ruta).

## Servicios
- **EventService (`core/services/event.service.ts`):** Suscribe en tiempo real (`onSnapshot`) a la colección de eventos (`/events`) de Firestore y maneja el CRUD de marcadores.
- **AdminService (`core/services/admin.service.ts`):** Valida los permisos de administración del usuario autenticado.

## Stores / Estados
- Escucha los cambios del listado de eventos en `EventService` para redibujar de forma fluida el mapa sin parpadeos.

## Rutas
- `/map`: Protegida por `AuthGuard` y `OnboardingGuard`.

## Dependencias
- `@angular/google-maps` (Wrapper oficial de Angular para Google Maps SDK).
- Google Maps JavaScript API (Script cargado en el archivo base `index.html`).
