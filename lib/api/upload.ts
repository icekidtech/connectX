/**
 * File Upload API Service
 * 
 * Handles image and video uploads to Backblaze B2 via backend
 */

import { useMutation } from '@tanstack/react-query';

export interface UploadResponse {
  url: string;
  publicId: string;
  type: 'image' | 'video';
}

/**
 * Upload image mutation
 * Returns authenticated URL from Backblaze B2
 */
export function useMutationUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Send auth cookies
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
  });
}

/**
 * Upload video mutation
 * Returns authenticated URL from Backblaze B2
 */
export function useMutationUploadVideo() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
  });
}

/**
 * Delete file mutation
 * Soft-deletes file from Backblaze B2
 */
export function useMutationDeleteFile() {
  return useMutation({
    mutationFn: async (publicId: string): Promise<void> => {
      const response = await fetch(`/api/upload/${publicId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }
    },
  });
}
