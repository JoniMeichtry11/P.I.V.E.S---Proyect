export interface Parent {
  name: string;
  email: string;
  phone: string;
}

export interface Progress {
  ruedas: number;
  volantes: number;
  milestones: string[];
  currentCardIndex: number;
  fuelLiters: number;
  familyActionsProgress: number;
}

export interface Accessories {
  unlocked: string[];
  equipped: string | null;
}

export interface Booking {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  date: string;
  time: string;
  car: CarModel;
  remindersSent: {
    dayBefore: boolean;
    sameDay: boolean;
  };
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  progress: Progress;
  bookings: Booking[];
  hasCompletedOnboarding: boolean;
  accessories: Accessories;
  usedRedeemCodes: string[];
}

export interface UserAccount {
  uid: string;
  parent: Parent;
  children: Child[];
  isAdmin?: boolean;
}

export interface CarModel {
  id: string;
  name: string;
  image: string;
  pricePerSlot: number;
}

export interface Question {
  image: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  audience: 'child' | 'parent';
}

export interface Accessory {
  id: string;
  name: string;
  icon: string;
  price: number;
}

export interface Milestone {
  key: string;
  name: string;
  icon: string;
}

export interface FamilyActionCard {
  id: number;
  consignas: string[];
}

export interface Event {
  id?: string;
  title: string;
  date: string;
  location: string;
  description: string;
  lat: number;
  lng: number;
  route?: { lat: number, lng: number }[];
  time?: string;
  category?: 'practica' | 'presentacion' | 'taller' | 'competencia';
}

export interface FuelPackage {
  liters: number;
  price: number;
  bonus?: string;
  bgColor: string;
}

export interface AnswerSummary {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}


