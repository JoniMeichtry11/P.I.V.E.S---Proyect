# P.I.V.E.S. — Proyecto de Educación Vial y Reservas (Raíz)

Este repositorio contiene la plataforma del **Programa Infantil de Vialidad y Educación Vial (P.I.V.E.S.)**, una aplicación web interactiva que gamifica el aprendizaje de seguridad vial para niños de edad escolar y sus familias.

El proyecto está compuesto por:
1. **Frontend:** Una aplicación cliente construida en Angular 20.
2. **Backend:** Un servidor API REST liviano construido en Node.js/Express localizado en la carpeta `/server`.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Node.js (versión 18 o superior recomendada)
- Cuenta y base de datos de Firebase activa
- Cuenta de MercadoPago Developer (opcional para simulación de checkout)
- Cuenta de Resend para envío de correos electrónicos

### 1. Configuración del Servidor Backend (`/server`)
El backend requiere configurar variables de entorno en un archivo `.env` dentro de la carpeta `server/`:
```bash
cd server
npm install
```
Crea un archivo `server/.env` y define las siguientes variables:
```ini
PORT=3000
MP_ACCESS_TOKEN=tu_access_token_de_mercadopago
RESEND_API_KEY=tu_api_key_de_resend
SMTP_FROM='"P.I.V.E.S" <no-reply@tudominio.com.ar>'
FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", ...}' # O ubicar el archivo 'serviceAccountKey.json'
```
Para ejecutar el servidor localmente en el puerto `3000`:
```bash
npm start
```

### 2. Configuración del Frontend (`/`)
El frontend utiliza Angular CLI para compilar y ejecutar el proyecto, y maneja las credenciales mediante variables de entorno a través de un archivo `.env`:
```bash
npm install
```
Crea un archivo `.env` en la raíz del proyecto (puedes copiar el archivo de ejemplo `.env.example`):
```bash
cp .env.example .env
```
Y define las variables correspondientes con tus claves:
```ini
# Firebase Configuration
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain.firebaseapp.com
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_STORAGE_BUCKET=tu_storage_bucket.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id

# Backend URLs
DEV_BACKEND_URL=http://localhost:3000
PROD_BACKEND_URL=https://tu-prod-backend-url.com
```

Al ejecutar `npm run start` o `npm run build`, se ejecuta automáticamente un script (`scripts/set-env.js`) que genera dinámicamente los archivos en `src/environments/` (`environment.ts` y `environment.prod.ts`) a partir de tu archivo `.env`.

Para ejecutar el servidor de desarrollo en `http://localhost:4200`:
```bash
npm run start
```
*(Nota: El comando `npm start` corre `node scripts/set-env.js && ng serve --host 0.0.0.0` para generar los archivos de configuración y permitir que el frontend sea accesible en dispositivos móviles dentro de la misma red local).*

---

## 🗺️ Cómo Navegar el Código

La aplicación web Angular organiza su código siguiendo la arquitectura de módulos recomendada:

```
angular-pives/
├── server/                 # Servidor backend de Express (Pagos, correos, admin)
├── src/
│   ├── app/
│   │   ├── core/           # Servicios singleton, modelos globales, guards de rutas
│   │   ├── shared/         # Componentes visuales compartidos (Header, Loader, etc.)
│   │   └── features/       # 13 módulos lazy-loaded con el flujo de negocio
│   │       ├── landing/    # Portal web público inicial
│   │       ├── auth/       # Acceso y creación de cuenta familiar
│   │       ├── child-selection/ # Elección de perfil de niño activo
│   │       ├── onboarding/ # Tutorial guiado para el uso de la app
│   │       ├── home/       # Panel principal de control del niño
│   │       ├── flashcards/ # Trivias y desafíos de señales viales
│   │       ├── booking/    # Reservas de coches de la pista
│   │       ├── buy-fuel/   # Recarga de nafta con MercadoPago y cupones
│   │       ├── map/        # Mapa de eventos viales en Buenos Aires
│   │       ├── family-actions/ # checklist de seguridad vial en familia
│   │       ├── profile/    # Avatar, accesorios desbloqueados y monedas
│   │       ├── help/       # FAQ y soporte rápido por WhatsApp
│   │       └── admin/      # Panel de administración de datos
│   ├── environments/       # Configuración de entornos dev y prod
│   └── styles.css          # Estilos globales y Tailwind CSS v4 import
└── AGENTS.md               # Guía de verdad para el desarrollo asistido por IA
```

### Flujos Clave del Sistema
- **Autenticación (Firebase Auth):** El inicio de sesión carga los datos desde Firestore en `/users/{uid}`. Si el usuario no tiene su email confirmado, se impide el acceso.
- **Reserva y Combustible:** Las reservas de vehículos en `features/booking` consumen litros de nafta. La nafta se adquiere en `features/buy-fuel` mediante pasarela de MercadoPago o cupones prepagos.
- **Gamificación:** Las respuestas correctas en `features/flashcards` premian al usuario con ruedas y volantes, desbloqueando licencias y accesorios equipables en `features/profile`.

---

## 📄 Licencia y Autores
Este proyecto es privado. Desarrollado para el **Programa P.I.V.E.S.** por Luis Herrera.
