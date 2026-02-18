import { Accessory, CarModel, Question, FamilyActionCard, Event, FuelPackage, Milestone } from '../models/user.model';

export const AVATARS: string[] = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'
];

export const ACCESSORIES: Accessory[] = [
  { id: 'hat', name: 'Gorra de Conductor', icon: '🧢', price: 2 },
  { id: 'sunglasses', name: 'Gafas de Sol', icon: '🕶️', price: 3 },
  { id: 'crown', name: 'Corona de Rey/Reina', icon: '👑', price: 5 },
  { id: 'scarf', name: 'Bufanda de Carreras', icon: '🧣', price: 2 },
  { id: 'bowtie', name: 'Moño Elegante', icon: '🎀', price: 1 },
  { id: 'monocle', name: 'Monóculo', icon: '🧐', price: 4 },
];

export const MARA_HAPPY_URL = 'https://i.ibb.co/WNZJtpHZ/Mara.png';
export const MARA_THINKING_URL = 'https://i.ibb.co/rGsZXKnY/mara-Ok.png';

export const MILESTONES_ORDER: string[] = ['licencia', 'seguro', 'tarjeta_verde'];

export const MILESTONE_DATA: Record<string, Milestone> = {
  licencia: { key: 'licencia', name: 'Licencia de Conductor', icon: '🪪' },
  seguro: { key: 'seguro', name: 'Tarjeta de Seguro', icon: '📰' },
  tarjeta_verde: { key: 'tarjeta_verde', name: 'Tarjeta del Vehículo', icon: '💳' },
};

export const PREPAID_CODES: Record<string, number> = {
  'PIVESREGALO2': 2,
  'PIVESPROMO5': 5,
  'PIVESEXPERTO10': 10,
  'BIENVENIDAESPECIAL': 6,
};

export const FAMILY_ACTION_CARDS: FamilyActionCard[] = [
  { id: 1, consignas: ["Se detuvo completamente en la señal de 'PARE'.", "Miró a ambos lados antes de cruzar una esquina.", "Se detuvo con la luz amarilla o roja del semáforo."] },
  { id: 2, consignas: ["Dejó pasar a una persona en el paso de cebra.", "Tuvo paciencia con un ciclista en la calle.", "Agradeció con un gesto a otro conductor."] },
  { id: 3, consignas: ["Se puso el cinturón de seguridad antes de arrancar.", "Verificó que todos los pasajeros tuvieran el cinturón puesto.", "No inició la marcha hasta que todos estaban seguros."] },
  { id: 4, consignas: ["Respetó el límite de velocidad indicado en las señales.", "Disminuyó la velocidad cerca de una escuela o parque.", "Condujo suavemente, sin acelerar ni frenar de golpe."] },
  { id: 5, consignas: ["No usó el teléfono celular mientras conducía.", "Mantuvo la música a un volumen que permitía escuchar afuera.", "Estuvo atento/a al camino y no a otras distracciones."] },
  { id: 6, consignas: ["Estacionó en un lugar permitido y seguro.", "Dejó espacio suficiente para que otros autos pudieran pasar.", "No se subió a la acera al estacionar."] },
  { id: 7, consignas: ["Usó la bocina solo cuando fue necesario para avisar de un peligro.", "Cedió el paso a otro vehículo para que se incorporara al tráfico.", "Mantuvo la calma en un atasco o embotellamiento."] },
  { id: 8, consignas: ["Usó la luz de giro (guiño) para avisar que iba a doblar.", "Usó la luz de giro para avisar que iba a cambiar de carril.", "Apagó la luz de giro después de completar la maniobra."] },
  { id: 9, consignas: ["Encendió las luces del auto cuando empezó a oscurecer.", "Condujo más despacio y con más cuidado porque llovía.", "Usó el limpiaparabrisas para ver bien a través del vidrio."] },
  { id: 10, consignas: ["Fue especialmente cuidadoso/a al pasar por una zona escolar.", "Evitó tocar la bocina cerca de un hospital.", "Respetó los espacios de estacionamiento para personas con discapacidad."] },
  { id: 11, consignas: ["Señalizó correctamente antes de entrar a una rotonda.", "Cedió el paso a los vehículos que ya estaban dentro de la rotonda.", "Salió de la rotonda desde el carril exterior."] },
  { id: 12, consignas: ["Se aseguró de que no viniera nadie antes de abrir la puerta.", "Esperó a que los niños bajaran por el lado de la acera.", "Apagó el motor al esperar a alguien por un rato."] },
  { id: 13, consignas: ["Mantuvo una distancia segura con el auto de adelante.", "Frenó con tiempo y suavidad, sin asustar a los pasajeros.", "No se pegó al auto de adelante para apurarlo."] },
  { id: 14, consignas: ["Dejó pasar a una ambulancia o vehículo de emergencia.", "Fue respetuoso/a con los motociclistas.", "Planificó el viaje para salir con tiempo y sin apuro."] },
  { id: 15, consignas: ["Revisó que las ruedas tuvieran aire antes de un viaje.", "Mantuvo los vidrios y espejos del auto limpios.", "Se aseguró de tener combustible suficiente para el viaje."] },
  { id: 16, consignas: ["Explicó una señal de tránsito o una regla de seguridad durante el viaje.", "Felicitó a otro conductor por una buena acción.", "Respondió con calma a las preguntas sobre el camino."] }
];

export const CAR_MODELS: CarModel[] = [
  { id: 'car1', name: 'Buggito', image: 'https://i.ibb.co/8DPJkNFJ/buggy-rojo.jpg', pricePerSlot: 2 },
  { id: 'car2', name: 'Aventurero Azul', image: 'https://i.ibb.co/Ld81vLT5/hilux-azul.jpg', pricePerSlot: 2 },
  { id: 'car3', name: 'Princesa Rosa', image: 'https://i.ibb.co/hx8tmcK4/rosado.jpg', pricePerSlot: 2 },
  { id: 'car4', name: 'Rayo Blanco', image: 'https://i.ibb.co/ZRK9Ny1X/mercedes-blanco.jpg', pricePerSlot: 2 },
];

export const EVENTS: Event[] = [
  { title: 'Gran PRESENTACION', date: 'Sábado, 10 de enero de 2026', location: 'Plaza General San Martín', description: '¡Te esperamos! Habrá mucha diversión.' },
  { title: 'Practicas', date: 'Domingo, 11 de enero de 2026', location: 'Plaza Soldado Aguila', description: 'Un taller interactivo para aprender y practicar.' },
  { title: 'Día de Práctica en el Circuito', date: 'Sábado, 17 de enero de 2026', location: 'Circuito de Educación Vial "El Volante"', description: 'Ven a practicar con nuestros coches a batería en un circuito seguro y supervisado.' }
];

export const FUEL_PACKAGES: FuelPackage[] = [
  { liters: 2, price: 10000, bgColor: 'from-sky-400 to-blue-500' },
  { liters: 5, price: 22500, bonus: '¡10% DTO!', bgColor: 'from-green-400 to-emerald-500' },
  { liters: 10, price: 40000, bonus: '¡20% DTO!', bgColor: 'from-amber-400 to-orange-500' },
  { liters: 20, price: 75000, bonus: '¡El mejor valor!', bgColor: 'from-purple-500 to-indigo-600' },
];

export const TIME_SLOTS = {
  "Mañana": [
    { value: "10:00", label: "10:00 AM" }, { value: "10:15", label: "10:15 AM" },
    { value: "10:30", label: "10:30 AM" }, { value: "10:45", label: "10:45 AM" },
    { value: "11:00", label: "11:00 AM" }, { value: "11:15", label: "11:15 AM" },
    { value: "11:30", label: "11:30 AM" }, { value: "11:45", label: "11:45 AM" },
    { value: "12:00", label: "12:00 AM" }, { value: "12:15", label: "12:15 AM" },
    { value: "12:30", label: "12:30 AM" }, { value: "12:45", label: "12:45 AM" },
  ],
  "Tarde": [
    { value: "16:00", label: "04:00 PM" }, { value: "16:15", label: "04:15 PM" },
    { value: "16:30", label: "04:30 PM" }, { value: "16:45", label: "04:45 PM" },
    { value: "17:00", label: "05:00 PM" }, { value: "17:15", label: "05:15 PM" },
    { value: "17:30", label: "05:30 PM" }, { value: "17:45", label: "05:45 PM" },
    { value: "18:00", label: "06:00 PM" }, { value: "18:15", label: "06:15 PM" },
    { value: "18:30", label: "06:30 PM" }, { value: "18:45", label: "06:45 PM" },
  ]
};

export const QUESTIONS_PER_CARD = 3;

// Importar las preguntas desde el archivo separado
export { QUESTIONS } from './questions.data';

