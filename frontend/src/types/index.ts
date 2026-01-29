// ============================================
// Type Definitions for Pollen Paw Application
// Shared between frontend and backend
// ============================================

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
  species: 'cat' | 'dog';  
  breed?: string;
  age?: number;
  weight?: number;          
  photoUrl?: string;
  medicalNotes?: string;    
  createdAt: Date;
  updatedAt: Date;
}

export interface SymptomLog {
  id: number;
  petId: number;
  logDate: Date;            
  eyeSymptoms?: number;     
  furQuality?: number;        
  skinIrritation?: number;  
  respiratory?: number;     
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  pollen_data?: PollenDataPatch | null;
}

// Pollen Data Types
export interface PollenDataPatch {
  treePollen: number;
  grassPollen: number;
  weedPollen: number;
  pollenLevel: string;
}

// Comprehensive environmental data record
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
  species: 'cat' | 'dog';
  breed?: string;
  age?: number;
  weight?: number;
  photoUrl?: string;
  medicalNotes?: string;
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

// Frontend-specific types
export interface SymptomCategory {
  id: string;
  name: string;
  description: string;
  min: number;
  max: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Alias for backward compatibility with frontend code
export type Symptom = SymptomLog;
