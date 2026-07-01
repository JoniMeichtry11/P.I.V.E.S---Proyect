# Feature: Landing

## Responsabilidad
Esta característica representa la página de inicio o presentación pública del proyecto P.I.V.E.S. Ofrece una vista amigable sobre qué es la plataforma, sus objetivos educativos de vialidad para niños y familias, y provee botones de llamada a la acción para ingresar (`/welcome` o `/login`) y registrarse.

## Componentes Principales
- **LandingPage (`components/landing-page/landing-page.ts`):** Componente de la vista que inicializa los metadatos SEO.

## Servicios
- **Meta & Title (Angular):** Utilizados para actualizar el título e incorporar metaetiquetas de SEO (`description`, `keywords`) para indexación en buscadores.

## Stores / Estados
- No utiliza estados compartidos locales. Es una vista puramente informativa.

## Rutas
- `/` (Vacía, carga por defecto con `pathMatch: 'full'`).

## Dependencias
- `@angular/platform-browser` (para la gestión de títulos y metadatos SEO).
- Tailwind CSS v4 para el layout responsivo y efectos visuales modernos.
