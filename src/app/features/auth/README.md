# Feature: Auth

## Responsabilidad
Gestionar el flujo de ingreso y creación de cuentas del Programa P.I.V.E.S. Permite a los padres registrar una cuenta familiar declarando sus datos (Nombre, Teléfono, Email, Contraseña) y añadir el perfil de sus hijos (Nombre, Avatar, Género) en un único paso interactivo, forzando la confirmación de email antes de habilitar el ingreso al sistema.

## Componentes Principales
- **WelcomeComponent (`components/welcome/`):** Pantalla de bienvenida decorativa con accesos rápidos a login o registro.
- **LoginComponent (`components/login/`):** Componente dinámico reutilizado para inicio de sesión y registro familiar. Al estar en modo `register`, muestra un formulario interactivo para agregar perfiles de niños.

## Servicios
- **AuthService (`core/services/auth.service.ts`):** Maneja el registro (`register`), login (`login`), cierre de sesión (`logout`), envío de emails de verificación, validación de códigos de Firebase Auth (`oobCode`) y persistencia del perfil familiar inicial.
- **UserService (`core/services/user.service.ts`):** Usado para estructurar los campos iniciales de progreso de cada niño ingresado durante el registro.

## Stores / Estados
- Escucha activamente `AuthService.currentUser$` para manejar el estado del usuario en Firebase.

## Rutas
- `/welcome`: Pantalla de bienvenida.
- `/login`: Formulario de inicio de sesión.
- `/register`: Formulario de registro (inyección de modo `register` por `routeData`).

## Dependencias
- `@angular/forms` (FormBuilder, FormGroup, Validators) para validación reactiva de credenciales.
- Firebase Auth para registro, login e inicio de flujo de verificación de email.
