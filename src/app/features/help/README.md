# Feature: Help

## Responsabilidad
Servir como la sección de ayuda, preguntas frecuentes (FAQ) y soporte técnico. Provee respuestas claras sobre la compra de nafta, reservas de turnos y funcionamiento de la pista, además de suministrar información de contacto oficial y un enlace directo para abrir una conversación de soporte mediante WhatsApp Web.

## Componentes Principales
- **HelpComponent (`components/help/`):** Vista informativa que renderiza las preguntas frecuentes y gestiona el formateo del enlace telefónico de WhatsApp.

## Servicios
- No utiliza servicios específicos de negocio. Utiliza propiedades locales para los correos y teléfonos.

## Stores / Estados
- No consume estados reactivos globales.

## Rutas
- `/help`: Protegida por `AuthGuard` y `OnboardingGuard`.

## Dependencias
- API de enlace universal de WhatsApp (`https://wa.me/{telefono}`).
