// ============================================
// Pet Service
// Handles all pet-related API calls
// ============================================
 

import { api } from './api';
import { authService } from './authService'; 
import { Pet, CreatePetRequest } from '../types';

export const petService = {

  getPets: async (): Promise<Pet[]> => {
    try {
      const user = authService.getCurrentUser();
      const userId = user?.id;

      const response = await api.get<any>(`/pets${userId ? `?userId=${userId}` : ''}`);

      if (Array.isArray(response)) return response;
      return response.pets || [];
    } catch (error: any) {
      console.error('Get pets error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch pets');
    }
  },


  deletePet: async (id: number): Promise<void> => {
    try {
      await api.delete(`/pets/${id}`);
    } catch (error: any) {
      console.error('Delete pet error:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete pet');
    }
  },


  createPet: async (data: CreatePetRequest): Promise<Pet> => {
    try {
      const user = authService.getCurrentUser();
      const petData = {
        ...data,
        userId: user?.id 
      };

      const response = await api.post<any>('/pets', petData);
      return response.pet || response;
    } catch (error: any) {
      console.error('Create pet error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create pet');
    }
  },


  updatePet: async (id: number, data: Partial<CreatePetRequest>): Promise<Pet> => {
    try {
      const response = await api.put<any>(`/pets/${id}`, data);
      return response.pet || response;
    } catch (error: any) {
      console.error('Update pet error:', error);
      throw new Error(error.response?.data?.error || 'Failed to update pet');
    }
  }
};

export default petService;