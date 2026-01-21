// Shared TypeScript types for Pollen Paw
// Can be used by both frontend and backend

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: number;
  userId: number;
  name: string;
  type: 'cat' | 'dog';
  breed?: string;
  age?: number;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SymptomLog {
  id: number;
  petId: number;
  eyeSymptoms: number; // 1-5
  furQuality: number; // 1-5
  skinIrritation: number; // 1-5
  respiratory: number; // 1-5
  notes?: string;
  photoUrl?: string;
  logDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentalData {
  id: number;
  zipCode: string;
  date: Date;
  treePollen?: number;
  grassPollen?: number;
  weedPollen?: number;
  airQuality?: number;
  temperature?: number;
  humidity?: number;
  createdAt: Date;
}

// API Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  zipCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreatePetRequest {
  name: string;
  type: 'cat' | 'dog';
  breed?: string;
  age?: number;
}

export interface LogSymptomRequest {
  petId: number;
  eyeSymptoms: number;
  furQuality: number;
  skinIrritation: number;
  respiratory: number;
  notes?: string;
  photoBase64?: string; // Base64 encoded image
}

export interface CorrelationData {
  symptomType: string;
  correlation: number; // -1 to 1
  triggerPoint?: number;
  interpretation: string;
}

export interface AIInsight {
  summary: string;
  triggers: string[];
  recommendations: string[];
  confidence: number;
}
