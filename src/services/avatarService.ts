import { uploadImage, generateImagePath } from './imageService';
import { storage } from '../config/firebase';
import { ref, getBlob } from 'firebase/storage';

/**
 * Converts a canvas to a File object
 */
export const canvasToFile = (canvas: HTMLCanvasElement, fileName: string = 'avatar.png'): File => {
  // Create a blob from the canvas
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], fileName, {
          type: 'image/png',
          lastModified: Date.now(),
        });
        resolve(file);
      }
    }, 'image/png', 0.9);
  }) as any;
};

/**
 * Converts canvas to blob for direct processing
 */
export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      }
    }, 'image/png', 0.9);
  });
};

/**
 * Uploads an avatar image after cropping
 */
export const uploadAvatar = async (
  canvas: HTMLCanvasElement,
  userId: string,
  fileName: string = 'avatar.png'
): Promise<string> => {
  try {
    // Convert canvas to blob
    const blob = await canvasToBlob(canvas);
    
    // Create a File object from the blob
    const file = new File([blob], fileName, {
      type: 'image/png',
      lastModified: Date.now(),
    });

    // Generate path for avatar
    const imagePath = generateImagePath(userId, fileName, 'avatars');
    
    // Upload the file
    const downloadURL = await uploadImage(file, imagePath);
    
    console.log('Avatar uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Validates avatar file before processing
 */
export const validateAvatarFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB for avatar
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG and PNG files are allowed for avatars'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Avatar file size must be less than 10MB'
    };
  }

  return { isValid: true };
};

/**
 * Fetches an image from Firebase Storage as a blob URL to bypass CORS issues
 */
export const fetchImageAsBlob = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Fetching image as blob from URL:', imageUrl);
    
    // Use fetch with proper headers to get the image as blob
    const response = await fetch(imageUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'image/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the blob from the response
    const blob = await response.blob();
    console.log('Successfully downloaded blob, size:', blob.size, 'bytes');
    
    // Create a blob URL that can be used by the image editor
    const blobUrl = URL.createObjectURL(blob);
    console.log('Created blob URL:', blobUrl);
    
    return blobUrl;
  } catch (error) {
    console.error('Error fetching image as blob:', error);
    console.error('Original URL:', imageUrl);
    throw error;
  }
}; 