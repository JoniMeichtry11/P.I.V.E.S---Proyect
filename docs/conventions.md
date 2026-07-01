# Convenciones del Proyecto P.I.V.E.S.

Este documento recopila las convenciones y directrices de desarrollo identificadas a lo largo de la base de código del proyecto. Cualquier nueva funcionalidad debe alinearse estrictamente con estos lineamientos para mantener la homogeneidad del sistema.

---

## 1. Nomenclatura (Naming Conventions)

- **Carpetas y Archivos:** Todo en minúsculas y separado por guiones cortos (`kebab-case`). Ej: `child-selection`, `booking-routing.module.ts`.
- **Selectores de Componentes:** Deben comenzar con el prefijo `app-` seguido de la nomenclatura en kebab-case del componente. Ej: `selector: 'app-my-bookings'`.
- **Clases y Decoradores:** Utilizan la convención `PascalCase` finalizando con el tipo de clase correspondiente (`Component`, `Service`, `Module`, `Guard`). Ej: `FlashcardsComponent`, `UserService`, `AuthGuard`.
- **Métodos y Variables:** Escritos en `camelCase`. Ej: `activeChildIndexSubject`, `completeLevel()`, `calculateDiscountedPrice()`.
- **Variables Reactivas (RxJS):** Cualquier variable que exponga un `Observable` debe finalizar con el sufijo `$`. Ej: `activeChild$`, `currentUserAccount$`.
- **Constantes:** Escritas en mayúsculas sostenidas (`UPPER_SNAKE_CASE`). Ej: `QUESTIONS_PER_CARD`, `FAMILY_ACTION_CARDS`.

---

## 2. Inyección de Dependencias (DI)

- La inyección de dependencias se realiza exclusivamente a través del **constructor** de las clases, utilizando el modificador de acceso `private` o `public` para declarar la propiedad automáticamente.
- **Ejemplo estándar:**
  ```typescript
  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}
  ```
- No se utiliza la función `inject()` de Angular (introducida en versiones recientes) en las clases existentes; se mantiene la consistencia clásica basada en constructor.

---

## 3. Manejo de Estados y Reactividad (RxJS)

- **No se utilizan Angular Signals** en esta versión de la aplicación. Todo el manejo reactivo del estado se apoya en **RxJS**.
- **Services como State Containers:** El estado de la aplicación se centraliza en servicios singlenton del Core utilizando `BehaviorSubject` o `ReplaySubject`:
  - `BehaviorSubject` requiere un valor inicial (ej. `activeChildIndexSubject = new BehaviorSubject<number | null>(null)`).
  - `ReplaySubject(1)` retransmite el último valor emitido a los nuevos suscriptores y se usa cuando no hay un valor inicial coherente (ej. `currentUserAccountSubject = new ReplaySubject<UserAccount | null>(1)`).
- **Subscripción Limpia:**
  - En componentes se agrupan las suscripciones en un objeto `Subscription` instanciado localmente y limpiado en `ngOnDestroy`:
    ```typescript
    private subscriptions = new Subscription();
    
    ngOnInit() {
      this.subscriptions.add(
        this.userService.activeChild$.subscribe(...)
      );
    }
    
    ngOnDestroy() {
      this.subscriptions.unsubscribe();
    }
    ```
  - En directivas complejas o enrutadores también se emplea el patrón `takeUntil(this.destroy$)` con un `Subject<void>` que emite en `ngOnDestroy`.

---

## 4. Estilos y Diseño (Tailwind CSS v4)

- El proyecto utiliza **Tailwind CSS v4** integrado vía `@import "tailwindcss";` en el archivo global `src/styles.css`.
- **Estructura CSS:**
  - La mayoría de las interfaces están estructuradas mediante utilidades de Tailwind directamente en las plantillas HTML (`flex`, `grid`, `bg-sky-50`, `text-slate-800`, etc.).
  - Las animaciones personalizadas (como `@keyframes blob` o `float` utilizadas en la Landing page y pantallas infantiles) se definen de forma tradicional en `styles.css`.
  - La transición de páginas se facilita mediante selectores de opacidad y transiciones suaves (`transition-opacity duration-500 ease-in-out` en el contenedor `main` de `app.component.ts`).

---

## 5. Manejo de Formularios

- **Formularios Reactivos (`@angular/forms`):** Utilizados para flujos complejos de validación como la autenticación familiar (`LoginComponent`). Emplean `FormBuilder` para estructurar validaciones complejas en cascada (como forzar el nombre y teléfono del padre en registro pero no en login).
- **Formularios Basados en Plantillas / Data-binding:** Utilizados para ingreso rápido de datos o configuraciones en pantallas de juego y CRUDs sencillos (`[(ngModel)]`). Ej: en `BuyFuelComponent` para canjear cupones, en `OnboardingComponent` para validar inputs.

---

## 6. Gestión de Errores y Estados de Carga (Global UI)

El sistema implementa dos servicios clave para asegurar una experiencia de usuario limpia y homogénea en llamadas asíncronas (Firestore y backend REST):

- **Loader Global (`LoadingService`):**
  - Permite envolver promesas bloqueando la pantalla con un Spinner de carga.
  - **Uso:**
    ```typescript
    const result = await this.loadingService.executeWithLoading(
      () => miLlamadaPromesa(),
      'Mensaje que se muestra en el spinner...'
    );
    ```
- **Alertas y Errores (`ErrorService`):**
  - Captura excepciones y despliega notificaciones Toast flotantes (`showError`, `showWarning`, `showInfo`).
  - **Uso:**
    ```typescript
    try { ... } catch (error) {
      this.errorService.handleError(error, 'Título opcional', 'Mensaje por defecto');
    }
    ```

---

## 7. Integración con Firebase Web SDK (v10)

- Se utiliza el **SDK Web modular directo** de Firebase (`firebase/app`, `firebase/auth`, `firebase/firestore`).
- **No se importan módulos de AngularFire** en los controladores o servicios del negocio para mantener la inyección ligera e independiente. Toda interacción se realiza pasándole la instancia compartida de Firestore desde `FirebaseService` (ej: `doc(this.firebaseService.firestore, 'users', uid)`).
