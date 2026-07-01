# Contexto del Proyecto para IAs (docs/context.md)

Este documento resume el propósito de negocio, reglas de dominio y esquemas de datos de **P.I.V.E.S.** de manera concisa para que un Agente de IA pueda comprender el estado actual de la aplicación en segundos.

---

## 1. Reglas de Dominio y Lógica del Negocio

### A. Estructura de Cuentas Familiares
- Un usuario registrado es un "Padre" (`Parent`).
- Cada cuenta de Padre posee uno o más "Hijos" (`Child`).
- El sistema mantiene en memoria un "Niño Activo" sobre el cual impacta todo el flujo del juego, perfil y agendamiento.

### B. Sistema de Economía y Gamificación
El progreso se basa en tres monedas virtuales/recompensas vinculadas al perfil de cada hijo:
1. **Ruedas (R):** Se obtienen respondiendo cuestionarios de señales viales ("Flashcards"). Se utilizan como dinero en la tienda de avatares del perfil para comprar accesorios visuales.
2. **Volantes (V):** Se consiguen de forma automática al acumular 4 Ruedas (las Ruedas se resetean a 0 al transformarse). Al acumular 4 Volantes, el contador se reinicia y se desbloquea el siguiente Hito ("Milestone").
3. **Litros de Combustible (L):** Nafta virtual cargada mediante pago con tarjeta de crédito/débito (MercadoPago) o canje de cupones prepagos. Sirve como crédito para reservar turnos en la pista de conducción real de P.I.V.E.S.

### C. Hitos (Milestones) y Orden de Desbloqueo
1. **`licencia`:** Licencia de Conductor 🪪
2. **`seguro`:** Tarjeta de Seguro 📰
3. **`tarjeta_verde`:** Tarjeta del Vehículo 💳
*(Definidos en `MILESTONES_ORDER` en `app.constants.ts`)*

### D. Tienda de Accesorios (Avatar Shop)
- Artículos disponibles: Gorra de Conductor (`hat` - 2 R), Gafas de Sol (`sunglasses` - 3 R), Corona (`crown` - 5 R), Bufanda de Carreras (`scarf` - 2 R), Moño Elegante (`bowtie` - 1 R), Monóculo (`monocle` - 4 R).
- Solo se puede equipar un accesorio a la vez (`equipped: string | null`).

### E. Flujo de Turnos (Booking Rules)
- Vehículos disponibles: Buggito, Aventurero Azul, Princesa Rosa, Rayo Blanco (Costo de reserva: 2 L).
- Un niño solo puede reservar si posee la cantidad de litros que exige el coche.
- **Conflicto Familiar:** Si un padre intenta reservar un horario donde el niño activo ya tiene un turno agendado, el asistente ofrece reasignar el turno a uno de sus hermanos.
- **Cancelación:** Las reservas se pueden cancelar desde "Mis Reservas". Si faltan menos de 12 horas para el turno, se le prohíbe la cancelación y no se le reembolsa el combustible.

---

## 2. Estructura y Esquema de Colecciones (Firestore)

### Colección `/users/{uid}`
Representa la cuenta familiar. Cada documento contiene:
- `parent`: `{ name: string, email: string, phone: string }`
- `children`: Arreglo de objetos `Child`:
  - `id`: Identificador único autogenerado.
  - `name`: Nombre del niño.
  - `avatar`: Emoji que representa su avatar (ej: 🐶).
  - `gender`: `'male' | 'female'`.
  - `hasCompletedOnboarding`: Boolean.
  - `progress`: `{ ruedas: number, volantes: number, milestones: string[], currentCardIndex: number, fuelLiters: number, familyActionsProgress: number, activeDiscount?: number }`
  - `bookings`: Arreglo de objetos `Booking`:
    - `id`: ID único.
    - `status`: `'active' | 'completed' | 'cancelled'`.
    - `date`: `'YYYY-MM-DD'`.
    - `time`: `'HH:MM'`.
    - `car`: `CarModel` (id, name, image, pricePerSlot).
    - `remindersSent`: `{ dayBefore: boolean, sameDay: boolean }`.
  - `accessories`: `{ unlocked: string[], equipped: string | null }`.
  - `usedRedeemCodes`: Arreglo de strings (códigos canjeados).
- `isAdmin`: Boolean opcional.

#### Subcolección `/users/{uid}/fuelTransactions/{txId}`
Historial de transacciones de compra de nafta.
- Campos: `id`, `userId`, `childId`, `packageLiters`, `packagePrice`, `mpPaymentId`, `status` (`'pending' | 'approved' | 'rejected'`), `createdAt`.

### Colección `/events/{eventId}`
Marcadores del mapa interactivo.
- Campos: `id`, `title`, `date`, `location`, `description`, `lat`, `lng`, `time` (opcional), `category` (`'practica' | 'presentacion' | 'taller' | 'competencia'`), `route` (arreglo de coordenadas `{ lat, lng }` para dibujar la poligonal).

### Colección `/coupons/{couponCode}`
Códigos promocionales de combustible o descuentos. El ID del documento es el código en mayúsculas (ej: `PIVESREGALO2`).
- Campos: `id`, `code`, `type` (`'liters' | 'discount'`), `value` (cantidad de litros o porcentaje de dto), `description`, `maxUses` (número o null), `timesUsed` (número), `expiresAt` (ISO string o null), `createdAt`.

### Colección `/flashcards/{questionId}`
Banco de preguntas del cuestionario vial.
- Campos: `id`, `text`, `image` (URL), `options` (arreglo de strings), `correctAnswerIndex`, `explanation`, `audience` (`'child' | 'parent'`), `orderIndex`.

---

## 3. Endpoints del Backend REST (Node.js/Express)

Ubicado en la carpeta `/server` y desplegado en Render (`https://p-i-v-e-s-proyect.onrender.com`):

- **`POST /api/create-preference`:** Crea una preferencia en MercadoPago. Recibe items, back_urls de redirección con metadatos. Retorna `init_point` y `sandbox_init_point`.
- **`GET /api/payment-status/:id`:** Consulta a MercadoPago el estado de un pago (`payment_id`).
- **`POST /api/send-confirmation`:** Envía correo de confirmación de reserva usando Resend.
- **`GET /api/check-reminders`:** Endpoint para Cron. Escanea reservas activas para enviar recordatorios de fecha (24hs antes y mismo día) vía email.
- **`POST /api/delete-user/:uid`:** (Seguro - Admin) Elimina el usuario en Firebase Authentication.
- **`POST /api/verify-user/:uid`:** (Seguro - Admin) Fuerza la propiedad `emailVerified` en Firebase Authentication.
- **`GET /health`:** Health check de estado.
