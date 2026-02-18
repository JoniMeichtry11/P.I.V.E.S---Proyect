# Proyecto P.I.V.E.S. - Angular 20

Aplicación web educativa para educación vial de niños, migrada a Angular 20 con arquitectura modular.

## Características

- ✅ Arquitectura modular y escalable
- ✅ Separación de responsabilidades (componentes, servicios, modelos)
- ✅ TypeScript estricto
- ✅ Firebase para autenticación y base de datos
- ✅ Routing con guards de autenticación
- ✅ Tailwind CSS para estilos

## Instalación

```bash
npm install
```

## Desarrollo

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/           # Servicios core, guards, interceptors
│   ├── shared/         # Componentes, pipes, directivas compartidas
│   ├── features/       # Módulos de características
│   │   ├── auth/      # Autenticación
│   │   ├── home/       # Pantalla principal
│   │   ├── flashcards/ # Desafíos de señales
│   │   ├── booking/    # Reservas de coches
│   │   └── ...
│   └── app.component.ts
├── assets/             # Recursos estáticos
└── environments/       # Configuración de entornos
```

## Configuración Firebase

Edita `src/environments/environment.ts` con tu configuración de Firebase.


