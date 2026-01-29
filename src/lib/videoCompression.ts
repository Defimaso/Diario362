/**
 * Utility for client-side video handling
 * 
 * NOTE: Canvas-based video compression (MediaRecorder API) has been disabled
 * because it strips audio tracks on most mobile browsers. The original file
 * is returned directly to preserve audio.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

/**
 * Returns the original video file without compression.
 * 
 * Previous canvas-based compression using MediaRecorder was removed because:
 * 1. Video element must be muted to autoplay, breaking AudioContext capture
 * 2. AudioContext.createMediaElementSource doesn't work reliably on mobile
 * 3. Many browsers don't support adding audio tracks to canvas streams
 * 
 * The original file is returned to ensure audio is always preserved.
 */
export const compressVideo = async (
  file: File,
  _options: CompressionOptions = {}
): Promise<File> => {
  // Return original file to preserve audio
  // Video compression via canvas strips audio on most mobile browsers
  console.log('Skipping compression to preserve audio, returning original file');
  return file;
};

/**
 * Gets file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
