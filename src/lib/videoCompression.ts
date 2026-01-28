/**
 * Utility for client-side video compression before upload
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

/**
 * Compresses a video file using MediaRecorder API
 * Falls back to original file if compression is not supported
 */
export const compressVideo = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 720,
    maxHeight = 1280,
    videoBitsPerSecond = 1000000, // 1 Mbps
    audioBitsPerSecond = 128000, // 128 kbps
  } = options;

  // Check if MediaRecorder is supported
  if (!('MediaRecorder' in window)) {
    console.warn('MediaRecorder not supported, returning original file');
    return file;
  }

  // Check if the browser supports video compression
  const mimeType = 'video/webm;codecs=vp8,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    console.warn('Video compression codec not supported, returning original file');
    return file;
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      // Calculate new dimensions
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      // Create stream from canvas
      const stream = canvas.captureStream(30);

      // Add audio track if present
      try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        destination.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track);
        });
      } catch (e) {
        // No audio track or audio context error, continue without audio
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
        audioBitsPerSecond,
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        // If compressed is larger, use original
        if (blob.size >= file.size) {
          resolve(file);
          return;
        }

        const compressedFile = new File(
          [blob],
          file.name.replace(/\.[^/.]+$/, '.webm'),
          { type: 'video/webm' }
        );
        resolve(compressedFile);
      };

      mediaRecorder.onerror = () => {
        resolve(file); // Fallback to original on error
      };

      mediaRecorder.start();

      // Play video and draw to canvas
      video.play();

      const drawFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      video.onended = () => {
        mediaRecorder.stop();
      };
    };

    video.onerror = () => {
      resolve(file); // Fallback to original on error
    };

    video.src = URL.createObjectURL(file);
  });
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
