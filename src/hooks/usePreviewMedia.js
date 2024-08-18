import { useState } from "react";
import useShowToast from "./useShowToast";
import { checkImageForExplicitContent } from "../utils/imageService";

const usePreviewMedia = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const showToast = useShowToast();
  const maxFileSizeInBytes = 50 * 1024 * 1024; // 50MB

  const getVideoDuration = (videoUri, videoType) => {
    return new Promise((resolve, reject) => {
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
        showToast('Failed to load video metadata');
        reject(new Error('Failed to load video metadata'));
      });
    });
  };

  const captureFrameWithRetry = async (video, canvas, context, currentTime, retries = 0, maxRetries = 3) => {
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

	  video.crossOrigin = 'anonymous'

	  //showToast("captureFrame started");

      const onCanPlay = async () => {
        try {
		  //showToast("Before draw image");
          await context.drawImage(video, 0, 0, canvas.width, canvas.height);

		  //showToast("drawimage");

          const imageBase64 = await canvas.toDataURL('image/jpeg').split(',')[1];
          const result = await checkImageForExplicitContent(imageBase64);
		  
		  //showToast("result", result);

          if (result === true) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          //showToast("Error capturing frame");
          reject(error);
        }
      };

	 // showToast("before canPlay listener");

      video.addEventListener('canplay', onCanPlay, { once: true });
	  //onCanPlay();
      video.addEventListener('error', () => reject(new Error('Error seeking video')), { once: true });

	  video.load();
    });
  };

  const checkVideoForExplicitContent = async (videoUri, videoType = 'video/mp4') => {
    try {
	  
	//   if (videoUri)
	// 	showToast('videoUri is present');

      const duration = await getVideoDuration(videoUri, videoType);
      const video = document.createElement('video');

      const source = document.createElement('source');
      source.src = videoUri;
      source.type = videoType;
      video.appendChild(source);

      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const interval = 3; // Capture every 5 seconds
      let unsafeContentDetected = false;

      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          resolve();
        }, { once: true });
		//showToast("before event listener error");
        video.addEventListener('error', () => reject(new Error('Failed to load video metadata')), { once: true });
		//showToast("after event listener error");
      });

      for (let currentTime = 0; currentTime <= duration; currentTime += interval) {
        if (unsafeContentDetected) break;

		//showToast("frameResult loop");

        const frameResult = await captureFrame(video, canvas, context, currentTime);
		//showToast(frameResult);
        if (frameResult === true) {
		  
          unsafeContentDetected = true;
        }
      }

      return unsafeContentDetected;
    } catch (error) {
      console.error('Error checking video content:', error);
	  showToast('Error checking video content:', error);
      throw new Error('Failed to check video content');
    }
  };

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      if (file.size > maxFileSizeInBytes) {
        showToast("Error", "File size must be less than 50MB", "error");
        setSelectedFile(null);
        return;
      }

      const reader = new FileReader();

      reader.onloadend = async () => {
        const fileContent = reader.result;

        try {
          let result;

          if (file.type.startsWith("image/")) {
            const base64Image = fileContent.split(',')[1];
            result = await checkImageForExplicitContent(base64Image);
          } else if (file.type.startsWith("video/")) {
            showToast("Starting video processing...");
            result = await checkVideoForExplicitContent(fileContent);
          }

          if (result === true) {
            showToast("Warning", "This image/video contains explicit content and will not be uploaded", "warning");
            setSelectedFile(null);
          } else {
            setSelectedFile({ src: fileContent, type: file.type });
          }
        } catch (error) {
          showToast("Error", "Error checking content", "error");
          setSelectedFile(null);
        }
      };

      reader.readAsDataURL(file);
    } else {
      showToast("Error", "Please select an image or video file", "error");
      setSelectedFile(null);
    }
  };

  return { selectedFile, handleMediaChange, setSelectedFile };
};

export default usePreviewMedia;
