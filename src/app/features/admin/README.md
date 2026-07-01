# Feature: Admin

## Responsabilidad
Proveer un panel de control administrativo y de gestión de datos del sistema. Está restringido estrictamente para cuentas con atributo `isAdmin: true` en Firestore o con el correo de súper administrador (`testahermanos@gmail.com`). Permite ver estadísticas del sistema, gestionar usuarios (añadir nafta, borrar cuenta, otorgar rol admin, verificar correo), controlar reservas (completar o cancelar turnos), y realizar CRUD completo de Cupones y Tarjetas de Trivia (Flashcards).

## Componentes Principales
- **AdminDashboardComponent (`components/admin-dashboard/`):** Pantalla principal que renderiza estadísticas (Usuarios totales, Hijos, Reservas por estado, Nafta circulante).
- **AdminUsersComponent (`components/admin-users/`):** Listado de cuentas familiares con opciones de modificación y llamadas API seguras.
- **AdminBookingsComponent (`components/admin-bookings/`):** Visualización general de reservas en la pista con posibilidad de completado o cancelación manual.
- **AdminCouponsComponent (`components/admin-coupons/`):** Creación y control de códigos promocionales (`coupons` en Firestore).
- **AdminFlashcardsComponent (`components/admin-flashcards/`):** Editor de preguntas de opción múltiple (`flashcards` en Firestore).

## Servicios
- **AdminService (`core/services/admin.service.ts`):** Lógica central administrativa que actualiza campos de usuarios en Firestore y llama a la API del servidor Node.js (con token portador JWT `Bearer` del admin actual) para realizar borrado o verificación de Auth.
- **CouponService & FlashcardService:** Proveen las APIs necesarias para el CRUD de sus respectivos documentos.

## Stores / Estados
- Consume `UserService.currentUserAccount$` para validar el rol administrativo.

## Rutas
- `/admin`: Dashboard general.
- `/admin/users`: Gestión de usuarios.
- `/admin/bookings`: Gestión de turnos de pista.
- `/admin/coupons`: Gestión de cupones.
- `/admin/flashcards`: Gestión de preguntas de señales.
*(Todas protegidas por `AuthGuard` y `AdminGuard`)*

## Dependencias
- API REST del servidor en `/server` para mutación segura de cuentas de Firebase Auth.
- Token de identificación de Firebase (`getIdToken()`) para autorizar llamadas en cabecera HTTP.
