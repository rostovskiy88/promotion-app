import { uploadImage, generateImagePath } from './imageService';

export const canvasToFile = (canvas: HTMLCanvasElement, fileName: string = 'avatar.png'): Promise<File> => {
  return new Promise<File>(resolve => {
    canvas.toBlob(
      blob => {
        if (blob) {
          const file = new File([blob], fileName, {
            type: 'image/png',
            lastModified: Date.now(),
          });
          resolve(file);
        }
      },
      'image/png',
      0.9
    );
  });
};

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise(resolve => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        }
      },
      'image/png',
      0.9
    );
  });
};

export const uploadAvatar = async (
  canvas: HTMLCanvasElement,
  userId: string,
  fileName: string = 'avatar.png'
): Promise<string> => {
  try {
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
      error: 'Only JPG and PNG files are allowed for avatars',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Avatar file size must be less than 10MB',
    };
  }

  return { isValid: true };
};
