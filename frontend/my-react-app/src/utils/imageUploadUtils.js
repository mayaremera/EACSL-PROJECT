export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
};

const UNSUPPORTED_FORMATS = new Set(['heic', 'heif', 'tiff', 'tif', 'svg', 'raw']);

export function getSafeFileExtension(file) {
  if (file?.type && MIME_TO_EXT[file.type]) {
    return MIME_TO_EXT[file.type];
  }

  const nameExt = file?.name?.split('.').pop()?.toLowerCase();
  if (nameExt && ALLOWED_EXTENSIONS.has(nameExt)) {
    return nameExt === 'jpeg' ? 'jpg' : nameExt;
  }

  return 'jpg';
}

export function validateImageFile(file) {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file selected.' };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
    UNSUPPORTED_FORMATS.has(extension);

  if (isHeic) {
    return {
      valid: false,
      error: 'HEIC/HEIF images are not supported. Please convert the image to JPG or PNG and try again.',
    };
  }

  const isValidType =
    (file.type && file.type.startsWith('image/') && file.type !== 'image/svg+xml') ||
    ALLOWED_EXTENSIONS.has(extension);

  if (!isValidType) {
    return {
      valid: false,
      error: 'Please upload a JPG, PNG, GIF, or WebP image.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Image is too large (${sizeMB} MB). Maximum allowed size is 5 MB. Try compressing the image or saving it as JPG.`,
    };
  }

  return { valid: true, error: null };
}

export function getUploadErrorMessage(error, fallback = 'Failed to upload image. Please try again.') {
  if (!error) return fallback;

  const message = error.message || error.error || String(error);

  if (message.includes('Payload too large') || message.includes('maximum allowed size') || error.statusCode === 413) {
    return 'Image is too large for the server. Please compress it to under 5 MB and try again.';
  }

  if (message.includes('row-level security') || message.includes('RLS') || message.includes('policy') || error.statusCode === 403) {
    return 'Upload blocked by storage permissions. Please check that the storage bucket is public and has upload policies configured.';
  }

  if (message.includes('Bucket not found') || message.includes('not found') || error.statusCode === 404) {
    return 'Storage bucket not found. Please verify the Supabase storage bucket exists.';
  }

  if (message.includes('mime') || message.includes('MIME') || message.includes('content type')) {
    return 'This file type is not allowed. Please use JPG, PNG, GIF, or WebP.';
  }

  if (message.includes('Invalid file') || message.includes('too large')) {
    return message;
  }

  return `${fallback}\n\nDetails: ${message}`;
}

export function buildStorageFilePath(prefix = '', file) {
  const fileExt = getSafeFileExtension(file);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  return prefix ? `${prefix}${uniqueName}` : uniqueName;
}
