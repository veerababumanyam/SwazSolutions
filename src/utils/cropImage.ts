/**
 * Image Cropping Utility
 * 
 * Creates a cropped image from a source image using canvas.
 * Used by the ImageCropper component for client-side image manipulation.
 * 
 * @author SwazSolutions
 * @version 1.0.0
 */

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  blob: Blob;
  base64: string;
  width: number;
  height: number;
}

/**
 * Creates an HTMLImageElement from a URL
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Converts degrees to radians
 */
const getRadianAngle = (degreeValue: number): number => {
  return (degreeValue * Math.PI) / 180;
};

/**
 * Returns the new bounding area of a rotated rectangle
 */
const rotateSize = (width: number, height: number, rotation: number): { width: number; height: number } => {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

/**
 * Crop an image to the specified area with optional rotation
 * 
 * @param imageSrc - Source image URL or base64 string
 * @param pixelCrop - The crop area in pixels
 * @param rotation - Rotation angle in degrees (default: 0)
 * @param outputFormat - Output image format (default: 'image/jpeg')
 * @param quality - Output quality 0-1 (default: 0.92)
 * @returns Promise with cropped image blob and base64
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92
): Promise<CropResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to center for rotation
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // Extract the cropped area
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No 2d context');
  }

  // Set cropped canvas size
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped area to the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert to blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        // Convert blob to base64 for preview/upload
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            blob,
            base64: reader.result as string,
            width: pixelCrop.width,
            height: pixelCrop.height,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Resize an image to fit within max dimensions while maintaining aspect ratio
 * 
 * @param imageSrc - Source image URL or base64
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param outputFormat - Output format
 * @param quality - Output quality
 */
export async function resizeImage(
  imageSrc: string,
  maxWidth: number,
  maxHeight: number,
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92
): Promise<CropResult> {
  const image = await createImage(imageSrc);
  
  let { width, height } = image;

  // Calculate new dimensions maintaining aspect ratio
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            blob,
            base64: reader.result as string,
            width,
            height,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Calculate the center crop area for a given aspect ratio
 * 
 * @param imageWidth - Source image width
 * @param imageHeight - Source image height
 * @param aspectRatio - Target aspect ratio (width/height)
 */
export function getCenterCropArea(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number
): Area {
  const imageAspectRatio = imageWidth / imageHeight;
  
  let cropWidth: number;
  let cropHeight: number;

  if (imageAspectRatio > aspectRatio) {
    // Image is wider than target - crop sides
    cropHeight = imageHeight;
    cropWidth = cropHeight * aspectRatio;
  } else {
    // Image is taller than target - crop top/bottom
    cropWidth = imageWidth;
    cropHeight = cropWidth / aspectRatio;
  }

  return {
    x: (imageWidth - cropWidth) / 2,
    y: (imageHeight - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}
