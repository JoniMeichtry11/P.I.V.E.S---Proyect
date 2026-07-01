# P.I.V.E.S. — Guía de Desarrollo para IAs y Desarrolladores (AGENTS.md)

Este archivo es la **fuente de verdad** para cualquier sesión de desarrollo o análisis automatizado (IA) en el proyecto **P.I.V.E.S.** (Programa Infantil de Vialidad y Educación Vial). Su propósito es evitar que se deba escanear todo el proyecto en cada sesión, listando las reglas, convenciones, arquitectura y decisiones del sistema.

---

Antes de modificar el proyecto:

1. Leé completamente este archivo.
2. Leé los archivos dentro de /docs.
3. Considerá esta documentación como la fuente principal de contexto.
4. Solo analizá archivos del proyecto cuando necesites detalles específicos.
5. Mantené esta documentación actualizada cuando cambie la arquitectura.

---

## 1. Descripción del Proyecto

**P.I.V.E.S.** es una plataforma web interactiva y gamificada dedicada a la educación vial para niños y sus familias. El sistema está dividido en dos partes principales:
1. **Frontend (Angular 20):** Aplicación interactiva donde los niños juegan respondiendo cuestionarios de señales viales ("Flashcards"), ganan monedas virtuales ("Ruedas" y "Volantes"), desbloquean documentos de conducir ficticios, equipan accesorios a sus avatares, y agendan turnos para conducir coches eléctricos reales en la pista de educación vial de P.I.V.E.S. utilizando "Combustible" (nafta virtual) como moneda de reserva.
2. **Backend (Node.js/Express):** Servidor API que procesa pagos con MercadoPago para cargar combustible, envía correos de confirmación y recordatorios con la plataforma Resend, y provee tareas administrativas protegidas por Firebase Admin SDK (como eliminación de usuarios y verificación manual de emails).

---

## 2. Stack Tecnológico

- **Frontend Core:** Angular 20 (TypeScript estricto), RxJS 7.8, Zone.js 0.15.
- **Estilos:** Tailwind CSS v4 (importado mediante `@import` en `styles.css`), CSS-first configuration.
- **Base de Datos & Auth:** Firebase Web SDK v10 (Auth, Firestore en tiempo real).
- **Mapas:** Google Maps JavaScript API mediante `@angular/google-maps` (v21.1.5).
- **Backend:** Node.js, Express, Axios, Cors, Dotenv.
- **SDKs de Backend:** Firebase Admin SDK, MercadoPago SDK (v2.12.0), Resend SDK (v6.9.3 para envío de correos).

---

## 3. Arquitectura del Sistema (Frontend)

El frontend sigue una estructura modular limpia recomendada por Angular:
```
src/app/
├── core/       # Singleton Services, Guards, Modelos, Constantes (Módulo Core)
├── shared/     # Componentes visuales globales y compartidos (Módulo Shared)
└── features/   # Módulos Lazy-Loaded representando las vistas y características
```

### Flujo de Datos Principal
1. **Autenticación:** Gestionada en `AuthService`. Al iniciar sesión, se escucha el estado del usuario en Firebase Auth y se descarga el documento correspondiente en `/users/{uid}` en Firestore.
2. **Modelo de Cuenta Familiar:** Un usuario (adulto) posee un objeto `UserAccount` que contiene un perfil de `parent` y un arreglo de perfiles de `children` (hijos).
3. **Gestión de Niño Activo:** `UserService` mantiene el estado reactivo del hijo actualmente seleccionado por el padre (`activeChild$`). Toda acción de juego, progreso o reserva impacta sobre este perfil seleccionado.
4. **Sincronización Firestore:** Los cambios en el progreso del niño se envían de inmediato a Firestore. Un listener en tiempo real (`onSnapshot`) en `UserService` asegura que cualquier cambio en la base de datos se refleje en la interfaz de usuario de forma reactiva.
5. **Consumo de Combustible:** Para reservar un turno con un coche (ej. Buggito), el niño consume nafta virtual (`fuelLiters`). Esta nafta se carga mediante MercadoPago en la sección `buy-fuel`, lo cual genera una preferencia de pago en Express, redirige al usuario y, al retornar aprobado, actualiza los litros del niño activo en Firestore.

---

## 4. Convenciones de Código y Naming

- **Estructura de Componentes:** Cada componente se define dentro de su propio subdirectorio con sus archivos CSS, HTML y TS separados. Ej: `src/app/features/booking/components/booking/`.
- **Inyección de Dependencias:** Se realiza estrictamente mediante el constructor. Ej:
  ```typescript
  constructor(private userService: UserService, private router: Router) {}
  ```
- **Reactividad (RxJS):** 
  - Los observables de estado global terminan con el sufijo `$` (ej. `activeChild$`).
  - La suscripción y desuscripción debe ser limpia. Se utiliza `Subscription.add()` agrupando suscripciones para destruirlas en `ngOnDestroy` con `subscriptions.unsubscribe()`, o el operador `takeUntil(destroy$)`.
- **Manejo de Errores y Carga (Global UI):**
  - Para mostrar loaders dinámicos en promesas: `await this.loadingService.executeWithLoading(() => miAccionAsync(), 'Mensaje...')`.
  - Para manejar errores amigablemente en pantalla: `this.errorService.handleError(error, 'Título de error', 'Mensaje alternativo')`.
- **Base de Datos (Firestore):** Se interactúa directamente utilizando los métodos del Web SDK v10 (ej. `doc()`, `setDoc()`, `getDocs()`, `updateDoc()`) encapsulados dentro de servicios de Angular del módulo `core/services/` (ej. `CouponService`, `EventService`, `FlashcardService`).

---

## 5. Patrones a Seguir (SÍ)

- **Sí** usá `UserService` para leer u modificar cualquier dato del niño activo (`progress`, `bookings`, `accessories`, `usedRedeemCodes`).
- **Sí** encapsulá cualquier lógica de Firebase en un servicio del `core/services/`. Los componentes solo consumen métodos del servicio.
- **Sí** utilizá los wrappers de `LoadingService` y `ErrorService` en cada llamada de red o Firebase para que la UI responda consistentemente.
- **Sí** definí las rutas importantes dentro de `ROUTES_WITHOUT_HEADER` en `app.component.ts` si necesitás ocultar el Header de navegación, los Breadcrumbs y el Notification Manager (por ejemplo, en vistas de onboarding, login o selección de niños).
- **Sí** usá las directivas de control de flujo modernas de Angular (como `@if`, `@else`, `@for`) en lugar de `*ngIf` o `*ngFor` tradicionales.

---

## 6. Patrones a Evitar (NO)

- **No** importes ni configures módulos de Firebase directamente en los componentes. Toda la inicialización y el acceso al Auth/Firestore debe pasar a través de `FirebaseService` o el servicio core correspondiente.
- **No** modifiques documentos en Firestore sin validar la sesión del usuario.
- **No** realices consultas complejas de tipo `collectionGroup` en Firestore si podés filtrar colecciones a nivel de memoria (como la obtención de reservas ocupadas para evitar indexaciones innecesarias).
- **No** dejes suscripciones abiertas en RxJS. Asegurá siempre la limpieza del ciclo de vida en `ngOnDestroy`.
- **No** hardcodees credenciales de MercadoPago, Resend o Firebase en el código del servidor o cliente.
- **No** saltes el flujo de guards. Cualquier ruta protegida por el perfil del niño debe tener `canActivate: [AuthGuard, OnboardingGuard]`.

---

## 7. Estructura Simplificada de Carpetas

- `src/app/core/`:
  - `constants/`: Datos estáticos (ej. Avatares disponibles, Accesorios, Preguntas por defecto).
  - `guards/`: Control de acceso a rutas (`AuthGuard`, `OnboardingGuard`, `AdminGuard`).
  - `models/`: Tipos de TypeScript (`user.model.ts`).
  - `services/`: Lógica central (Auth, User, Admin, Coupons, Events, Payment, Text-To-Speech).
- `src/app/shared/`: Componentes comunes reutilizables (Header, Breadcrumb, Loader, NotificationManager).
- `src/app/features/`: Módulos autónomos lazy-loaded que encapsulan componentes, rutas y estilos locales de cada feature de la aplicación.
- `server/`: Código backend Node.js que gestiona las integraciones SMTP/Resend, MercadoPago y acciones administrativas en Firebase Auth.

Si modificás la arquitectura, agregás una feature, cambiás convenciones o incorporás nuevas dependencias, actualizá los archivos de documentación correspondientes antes de finalizar la tarea.