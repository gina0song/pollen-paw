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
}
// Symptom Log with dynamically injected pollen data
export interface SymptomLog {
  id: number;
  petId: number;         // Note: Mapping from pet_id in backend
  logDate: Date;            
  eyeSymptoms?: number;     
  furQuality?: number;        
  skinIrritation?: number;  
  respiratory?: number;     
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  pollen_data?: PollenDataPatch | null; // ✨ Dynamically injected patch
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


