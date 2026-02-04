// ============================================
// Symptom Service - FINAL FIX VERSION
// Handles all symptom-related API calls
// ============================================

import { api } from './api';
import { SymptomLog } from '../types';
import { authService } from './authService';

export interface CreateSymptomRequest {
  petId?: number; 
  pet_id?: number;  
  furQuality?: number;
  skinIrritation?: number;
  respiratory?: number;
  notes?: string;
  photoUrl?: string;
}

export const symptomService = {
 
  getSymptoms: async (petId?: number): Promise<SymptomLog[]> => {
    try {
      if (!petId) return [];

      const user = authService.getCurrentUser();
      const userId = user?.id;

      if (!userId) {
        console.warn('⚠️ User not logged in or userId not found');
        return [];
      }

      const url = `/symptoms?petId=${petId}&pet_id=${petId}&userId=${userId}`; 
      
      console.log(`🚀 Requesting symptoms with URL: ${url}`);
      const response = await api.get<any>(url);
      
      console.log('✅ Get symptoms raw response:', response);

      const data = Array.isArray(response) ? response : (response.symptoms || response.data || []);
      return data;
    } catch (error: any) {
      console.error('❌ Get symptoms error:', error);
      return [];
    }
  },

  /**
   * Create a new symptom log
   */
  createSymptom: async (data: CreateSymptomRequest): Promise<SymptomLog> => {
    try {
      const finalData = {
        ...data,
        pet_id: data.pet_id || data.petId 
      };
      
      const response = await api.post<SymptomLog>('/symptoms', finalData);
      return response;
    } catch (error: any) {
      console.error('Create symptom error:', error);
      throw new Error(error.response?.data?.error || 'Failed to log symptom');
    }
  },

  /**
   * Update an existing symptom log
   */
  updateSymptom: async (id: number, data: Partial<CreateSymptomRequest>): Promise<SymptomLog> => {
    try {
      const response = await api.put<{ symptom: SymptomLog }>(`/symptoms/${id}`, data);
      return response.symptom;
    } catch (error: any) {
      console.error('Update symptom error:', error);
      throw new Error(error.response?.data?.error || 'Failed to update symptom');
    }
  },

  /**
   * Delete a symptom log - FINAL FIX VERSION
   */
  deleteSymptom: async (id: number): Promise<void> => {
    try {
      // ✅ FINAL FIX: Directly read from localStorage to ensure we get the userId
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        throw new Error('User not authenticated');
      }

      let user;
      try {
        user = JSON.parse(userStr);
      } catch (parseError) {
        console.error('Failed to parse user data:', userStr);
        throw new Error('Invalid user data');
      }

      const userId = user?.id;

      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      console.log(`🚀 Deleting symptom ${id} for user ${userId}`);
      
      // ✅ Add userId as query parameter
      await api.delete(`/symptoms/${id}?userId=${userId}`);
      
      console.log(`✅ Symptom ${id} deleted successfully`);
    } catch (error: any) {
      console.error('Delete symptom error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete symptom');
    }
  },

  /**
   * Upload photo for symptom
   */
  uploadPhoto: async (file: File): Promise<string> => {
    try {
      console.log('Uploading photo:', file.name, file.type);
      
      // ✅ Match backend expected field names
      const presignedResponse = await api.post<{ uploadUrl: string; photoUrl: string; key: string }>('/upload', {
        fileName: file.name,     // Backend expects 'fileName' not 'filename'
        fileType: file.type,     // Backend expects 'fileType' not 'contentType'
      });

      console.log('Got presigned URL:', presignedResponse.uploadUrl);

      // Upload file to S3 using presigned URL
      const uploadResult = await fetch(presignedResponse.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error(`S3 upload failed with status ${uploadResult.status}`);
      }

      console.log('Photo uploaded successfully:', presignedResponse.photoUrl);

      // ✅ Return photoUrl instead of key
      return presignedResponse.photoUrl;
    } catch (error: any) {
      console.error('Upload photo error:', error);
      throw new Error('Failed to upload photo');
    }
  },
};

export default symptomService;