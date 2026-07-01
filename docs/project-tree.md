# Árbol del Proyecto P.I.V.E.S.

A continuación se presenta un árbol simplificado del directorio de trabajo de la aplicación, detallando el propósito y la responsabilidad de cada carpeta y archivo clave.

```
angular-pives/
├── .agents/                    # Configuraciones de agentes y lints locales (opcional)
├── docs/                       # Documentación técnica general del sistema
│   ├── architecture.md         # Arquitectura detallada, flujos y diagramas
│   ├── conventions.md          # Convenciones de programación detectadas
│   ├── project-tree.md         # (Este archivo) Explicación del árbol de directorios
│   └── context.md              # Resumen técnico de la app para IA
├── server/                     # Directorio del Servidor Backend (Node.js/Express)
│   ├── .env                    # Configuración de variables de entorno (Local/Privado)
│   ├── email.service.js        # Servicio de integración con Resend SDK para emails
│   ├── index.js                # Punto de entrada principal y API REST del backend
│   ├── package.json            # Dependencias del servidor Node.js
│   └── serviceAccountKey.json  # Claves de Firebase Admin SDK (Local/Privado)
├── src/                        # Código Fuente de la Aplicación Angular (Frontend)
│   ├── app/                    # Código de negocio Angular
│   │   ├── core/               # Módulo central (Singletons, constantes, models, guards)
│   │   │   ├── constants/      # Datos estáticos (Avatares, accesorios, preguntas)
│   │   │   │   ├── app.constants.ts    # Configuración de avatares, accesorios, etc.
│   │   │   │   └── questions.data.ts   # Cuestionario base de señales viales
│   │   │   ├── guards/         # Control de acceso a rutas
│   │   │   │   ├── admin.guard.ts      # Restringe acceso a administradores
│   │   │   │   ├── auth.guard.ts       # Restringe acceso a usuarios no autenticados
│   │   │   │   └── onboarding.guard.ts # Asegura completado de tutorial inicial
│   │   │   ├── models/         # Interfaces y tipos TypeScript
│   │   │   │   ├── breadcrumb.model.ts # Estructura de navegación secundaria
│   │   │   │   └── user.model.ts       # Definiciones de usuarios, niños, reservas, etc.
│   │   │   ├── services/       # Servicios inyectables a nivel de root (Singletons)
│   │   │   │   ├── auth.service.ts         # Registro, Login y Auth de Firebase
│   │   │   │   ├── user.service.ts         # Gestión de perfiles de niños y progreso
│   │   │   │   ├── admin.service.ts        # Métodos administrativos y llamadas HTTP
│   │   │   │   ├── loading.service.ts      # Control de loaders globales
│   │   │   │   ├── error.service.ts        # Despliegue de alertas de error en UI
│   │   │   │   ├── payment.service.ts      # Creación de preferencias en MercadoPago
│   │   │   │   ├── text-to-speech.service.ts # Lector de texto con voces es-AR
│   │   │   │   ├── flashcard.service.ts    # Carga y edición de trivias viales
│   │   │   │   ├── coupon.service.ts       # Gestión de códigos de nafta
│   │   │   │   ├── event.service.ts        # Administración de marcadores del mapa
│   │   │   │   ├── breadcrumb.service.ts   # Manejador del mapa de navegación
│   │   │   │   └── notification.service.ts # Generador de Google Calendar y WhatsApp links
│   │   │   └── core.module.ts  # Declaración e inyección inicial de servicios
│   │   ├── shared/             # Módulo compartido (UI reutilizable)
│   │   │   ├── components/     # Componentes compartidos globales
│   │   │   │   ├── header/                # Barra superior de navegación y avatar activo
│   │   │   │   ├── breadcrumb/            # Barra secundaria con indicador de ruta
│   │   │   │   ├── loader/                # Pantalla de carga superpuesta (Spinner)
│   │   │   │   ├── error-notifications/   # Alertas visuales flotantes de error/info
│   │   │   │   └── notification-manager/  # Gestor de notificaciones internas
│   │   │   └── shared.module.ts # Exportación de componentes y módulos de formularios
│   │   ├── features/           # Módulos Lazy-Loaded de características del sistema
│   │   │   ├── landing/        # Landing page pública inicial (SEO)
│   │   │   ├── auth/           # Bienvenida, login y formulario de registro familiar
│   │   │   ├── child-selection/ # Interfaz de elección/creación de perfil de niño
│   │   │   ├── onboarding/     # Tutorial interactivo de 7 pasos guiado por "Mara"
│   │   │   ├── home/           # Dashboard interactivo con los progresos y accesos
│   │   │   ├── flashcards/     # Cuestionarios de señales de tránsito con voz
│   │   │   ├── booking/        # Asistente de reservas y lista de turnos (mis reservas)
│   │   │   ├── buy-fuel/       # Venta de paquetes de combustible y canjes de códigos
│   │   │   ├── map/            # Localizador Google Maps de eventos con CRUD de Admin
│   │   │   ├── family-actions/ # checklist de acciones viales para copilotos
│   │   │   ├── profile/        # Tienda de accesorios para avatares y borrado de cuenta
│   │   │   ├── help/           # Preguntas frecuentes y chat con soporte
│   │   │   └── admin/          # Dashboard, usuarios, cupones, turnos y editor de trivias
│   │   ├── app-routing.module.ts # Enrutador principal de Angular (rutas y guards)
│   │   ├── app.component.ts      # Componente raíz (redirección por estado del usuario)
│   │   └── app.module.ts         # Registro global de módulos y Service Worker PWA
│   ├── environments/           # Variables de configuración por entorno (Dev/Prod)
│   ├── styles.css              # Archivo de estilos global con Tailwind CSS v4
│   └── main.ts                 # Archivo de arranque inicial de Angular
├── angular.json                # Configuración de compilación de Angular CLI
├── package.json                # Dependencias, scripts de arranque y librerías del cliente
├── tsconfig.json               # Configuración del compilador TypeScript
└── AGENTS.md                   # Fuente de verdad e instrucciones de desarrollo IA
```
