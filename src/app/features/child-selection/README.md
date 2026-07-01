# Feature: Child Selection

## Responsabilidad
Habilitar una interfaz para que el padre elija cuál de sus hijos usará la aplicación en la sesión actual. En caso de que la cuenta familiar cuente con un único hijo registrado, el sistema omite esta pantalla auto-seleccionándolo. Además, permite agregar un nuevo perfil de niño en tiempo real a la cuenta familiar.

## Componentes Principales
- **ChildSelectionComponent (`components/child-selection/`):** Listado visual de perfiles con sus respectivos avatares y formulario interactivo (Modal) para añadir nuevos niños.

## Servicios
- **UserService (`core/services/user.service.ts`):** Gestiona la selección del niño activo (`setActiveChildIndex`), lee la lista de hijos asociados a la cuenta de usuario y procesa la creación de nuevos perfiles (`addChild`).

## Stores / Estados
- Suscrito a `UserService.currentUserAccount$` para renderizar de manera reactiva la lista de niños cargada desde Firestore.

## Rutas
- `/child-selection`: Protegida por `AuthGuard`.

## Dependencias
- `CoreModule` (para el uso de constantes globales como `AVATARS`).
