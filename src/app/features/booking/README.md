# Feature: Booking

## Responsabilidad
Gestionar el agendamiento y control de turnos para que los niños asistan a conducir coches eléctricos reales en la pista física de P.I.V.E.S. El sistema utiliza una nafta virtual ("Combustible") como crédito de reserva. El módulo maneja tanto el proceso de reserva paso a paso (asistente) como el listado de reservas realizadas e histórico con políticas de cancelación.

## Componentes Principales
- **BookingComponent (`components/booking/`):** Asistente paso a paso para reservar:
  1. *Selección de Vehículo:* Valida que el niño activo posea suficiente combustible (nafta).
  2. *Fecha y Hora:* Comprueba la disponibilidad en la pista y si el niño tiene conflicto de horario (ofreciendo reasignar la reserva a un hermano).
  3. *Confirmación:* Resumen de costos.
  4. *Éxito:* Accesos para añadir al calendario y compartir por WhatsApp.
- **MyBookingsComponent (`components/my-bookings/`):** Listado cronológico de turnos del grupo familiar con opción de cancelación (reembolsa combustible si se hace con un mínimo de 12 horas de anticipación).

## Servicios
- **UserService (`core/services/user.service.ts`):** Guarda la reserva (`addBooking`/`addBookingForChild`) y procesa reembolsos por cancelación (`cancelBooking`).
- **AdminService (`core/services/admin.service.ts`):** Consulta la base de datos para recuperar todos los turnos del día y evitar reservas duplicadas en el mismo vehículo (`getGloballyBookedSlots`).
- **NotificationService (`core/services/notification.service.ts`):** Construye plantillas de Google Calendar y mensajes personalizados para WhatsApp.

## Stores / Estados
- Escucha `UserService.activeChild$` y `currentUserAccount$` para manejar la disponibilidad de combustible familiar y nombres de perfiles.

## Rutas
- `/booking`: Asistente de reserva.
- `/booking/my-bookings`: Lista de reservas de la familia.

## Dependencias
- `@angular/common/http` (HttpClient) para solicitar al backend el envío automático del correo de confirmación de reserva.
