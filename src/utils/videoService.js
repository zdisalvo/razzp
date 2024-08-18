import { checkImageForExplicitContent } from './imageService';
import useShowToast from '../hooks/useShowToast';



const getVideoDuration = (videoUri, videoType) => {
  return new Promise((resolve, reject) => {
    const showToast = useShowToast();
    const video = document.createElement('video');
    
    // Add source with type
    const source = document.createElement('source');
    source.src = videoUri;
    source.type = videoType;
    video.appendChild(source);

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
    });

    video.addEventListener('error', () => {
      showToast('failed to load video metadata');
      reject(new Error('Failed to load video metadata'));
    });
  });
};

export const checkVideoForExplicitContent = async (videoUri, videoType = 'video/mp4') => {
  const maxRetries = 3;
  const showToast = useShowToast();

  if(videoUri)
    showToast("video uri present");

  const captureFrameWithRetry = async (video, canvas, context, currentTime, retries = 0) => {
    try {
      return await captureFrame(video, canvas, context, currentTime);
    } catch (error) {
      if (retries < maxRetries) {
        console.warn(`Retry ${retries + 1}/${maxRetries} for time ${currentTime}`);
        return captureFrameWithRetry(video, canvas, context, currentTime, retries + 1);
      } else {
        console.error(`Failed to capture frame at time ${currentTime} after ${maxRetries} retries`);
        showToast(`Failed to capture frame at time ${currentTime} after ${maxRetries} retries`);
        throw error;
      }
    }
  };

  const captureFrame = (video, canvas, context, currentTime) => {
    return new Promise((resolve, reject) => {
      video.currentTime = currentTime;

      const onCanPlay = async () => {
        try {
          // Draw the video frame on the canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert the canvas content to a base64 image string
          const imageBase64 = await canvas.toDataURL('image/jpeg').split(',')[1];
          showToast(imageBase64);
          const result = await checkImageForExplicitContent(imageBase64);

          if (result === true) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          showToast(error);
          reject(error);
        }
      };

      video.addEventListener('canplay', onCanPlay, { once: true });
      video.addEventListener('error', () => reject(new Error('Error seeking video')), { once: true });
    });
  };

  try {
    const duration = await getVideoDuration(videoUri, videoType);
    const video = document.createElement('video');

    // Add source with type
    const source = document.createElement('source');
    source.src = videoUri;
    source.type = videoType;
    video.appendChild(source);

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const interval = 5; // Capture every 5 seconds
    let unsafeContentDetected = false;

    // Ensure video metadata is loaded before proceeding
    await new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        resolve();
      }, { once: true });

      video.addEventListener('error', () => reject(new Error('Failed to load video metadata')), { once: true });
    });

    // Loop through the video duration to capture frames
    for (let currentTime = 0; currentTime <= duration; currentTime += interval) {
      if (unsafeContentDetected) break; // Exit early if unsafe content is detected

      const frameResult = await captureFrameWithRetry(video, canvas, context, currentTime);
      if (frameResult) {
        unsafeContentDetected = true;
      }
    }

    return unsafeContentDetected;
  } catch (error) {
    console.error('Error checking video content:', error);
    throw new Error('Failed to check video content');
  }
};
