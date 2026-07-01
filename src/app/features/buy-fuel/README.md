# Feature: Buy Fuel

## Responsabilidad
Proveer la interfaz para que las familias adquieran combustible virtual ("nafta"), necesario para reservar turnos en la pista. Permite comprar paquetes de combustible integrados con MercadoPago (procesando los pagos reales en el backend) o canjear cupones promocionales/códigos prepagos para obtener nafta gratis o descuentos sobre el valor de los paquetes.

## Componentes Principales
- **BuyFuelComponent (`components/buy-fuel/`):** Muestra el listado de paquetes de combustible y gestiona la entrada de códigos promocionales.
- **PaymentResultComponent (`components/payment-result/`):** Recibe el retorno del checkout de MercadoPago (`/status?result=...`), consulta la API del servidor para confirmar el estado del pago, guarda la transacción en Firestore e incrementa el combustible del niño.

## Servicios
- **PaymentService (`core/services/payment.service.ts`):** Solicita la creación de la preferencia de pago al backend de Express y almacena las transacciones procesadas en Firestore.
- **CouponService (`core/services/coupon.service.ts`):** Valida la existencia, fecha de vencimiento y cantidad máxima de usos de un cupón en Firestore.
- **UserService (`core/services/user.service.ts`):** Incrementa los litros de combustible (`addFuel`) y procesa el canje de cupones (`redeemCode`).

## Stores / Estados
- Consume `UserService.activeChild$` para aplicar descuentos activos y conocer el combustible actual del niño seleccionado.

## Rutas
- `/buy-fuel`: Pantalla de recarga y cupones.
- `/buy-fuel/status`: Recepción e inspección de pagos (MercadoPago redirects).

## Dependencias
- Pasarela de Checkout Pro de MercadoPago.
- `@angular/common/http` para comunicarse con la API de pagos del backend.
