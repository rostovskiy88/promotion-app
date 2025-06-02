import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageUploadOptions {
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

/**
 * Validates image file type and size
 */
export const validateImageFile = (
  file: File, 
  options: ImageUploadOptions = {}
): { isValid: boolean; error?: string } => {
  const { maxSize = MAX_FILE_SIZE, allowedTypes = ALLOWED_IMAGE_TYPES } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG and PNG files are allowed'
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
    };
  }

  return { isValid: true };
};

/**
 * Uploads an image to Firebase Storage
 */
export const uploadImage = async (
  file: File,
  path: string,
  options: ImageUploadOptions = {}
): Promise<string> => {
  console.log('Starting image upload:', { fileName: file.name, path, fileSize: file.size });
  
  // Validate the file first
  const validation = validateImageFile(file, options);
  if (!validation.isValid) {
    console.error('File validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Create a reference to the file location
    const imageRef = ref(storage, path);
    console.log('Created storage reference:', path);
    
    // Upload the file
    console.log('Starting upload to Firebase Storage...');
    const snapshot = await uploadBytes(imageRef, file);
    console.log('Upload completed successfully:', snapshot.metadata.fullPath);
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading image:', {
      error: error.message,
      code: error.code,
      details: error
    });
    
    // Handle specific Firebase errors
    if (error.code === 'storage/unauthorized') {
      throw new Error('Not authorized to upload images. Please check your permissions.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('An unknown error occurred. Please try again.');
    } else if (error.code === 'storage/invalid-format') {
      throw new Error('Invalid file format. Please use JPG or PNG files.');
    } else {
      throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Deletes an image from Firebase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    console.log('Image deleted successfully:', imageUrl);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for deletion failures as it's not critical
  }
};

/**
 * Generates a unique filename for an image
 */
export const generateImagePath = (
  userId: string,
  originalFileName: string,
  folder: string = 'articles'
): string => {
  const timestamp = Date.now();
  const cleanFileName = originalFileName.replace(/[^a-zA-Z0-9.]/g, '_');
  const path = `${folder}/${userId}/${timestamp}_${cleanFileName}`;
  console.log('Generated image path:', path);
  return path;
}; 