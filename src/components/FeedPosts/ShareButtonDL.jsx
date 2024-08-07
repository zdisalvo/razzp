import React, { useRef } from 'react';
import { storage, ref, uploadString, getDownloadURL } from "../../firebase/firebase"; // Adjust path as necessary

const ShareButtonDL = ({ imageUrl, overlayText }) => {
  const canvasRef = useRef(null);

  const prepareImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    const overlayImage = new Image();
    const overlayImageUrl = 'razzp-mobile-logo-shadow.png';

    baseImage.crossOrigin = 'anonymous'; // Handle cross-origin images if needed
    overlayImage.crossOrigin = 'anonymous';

    baseImage.src = imageUrl;
    overlayImage.src = overlayImageUrl;

    baseImage.onload = () => {
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      ctx.drawImage(baseImage, 0, 0);

      // Overlay text
      if (overlayText) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(overlayText, canvas.width / 2, canvas.height / 2);
      }

      // Overlay image
      if (overlayImageUrl) {
        overlayImage.onload = () => {
          ctx.drawImage(overlayImage, 50, 50, 100, 100);
          uploadImageToFirebase(); // Call the function to upload the image
        };
      } else {
        uploadImageToFirebase(); // Call the function to upload the image if no overlay image
      }
    };
  };

  const uploadImageToFirebase = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg'); // Convert canvas to data URL
    const imageRef = ref(storage, 'instagram/overlay-image.jpg'); // Firebase Storage path

    try {
      // Upload the image
      await uploadString(imageRef, dataUrl, 'data_url');
      
      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);

      const instagramAppUrl = `instagram://library?AssetPath=${encodeURIComponent(downloadURL)}`;
      
      window.location.href = instagramAppUrl;

      // Open the Instagram app or website with the image URL
      //openInstagramWithImage(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const openInstagramWithImage = (imageUrl) => {
    const instagramWebUrl = `https://www.instagram.com/`;

    // Create an anchor element and set it to the image URL
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.target = '_blank';
    anchor.click(); // Trigger the download or open in new tab
    
    // Open Instagram in a new tab as a fallback
    setTimeout(() => {
      window.open(instagramWebUrl, '_blank');
    }, 500);
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={prepareImage}>Prepare and Share to Instagram</button>
    </div>
  );
};

export default ShareButtonDL;
