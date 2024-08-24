import React, { useRef } from 'react';
import { Box, Image as ChakraImage } from "@chakra-ui/react";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase"; // Adjust path as necessary
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useAuthStore from '../../store/authStore';

const ShareButtonDL = ({ imageUrl, overlayText }) => {
  const canvasRef = useRef(null);
  const authUser = useAuthStore((state) => state.user);
  // OVERLAY_RATIO = 0.133

  const prepareImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    const overlayImage = new Image();
    const overlayImageUrl = '/razzp-logo-matte.png';

    baseImage.crossOrigin = 'anonymous'; // Handle cross-origin images if needed
    overlayImage.crossOrigin = 'anonymous';

    baseImage.src = imageUrl;
    overlayImage.src = overlayImageUrl;

    baseImage.onload = () => {
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      ctx.drawImage(baseImage, 0, 0);

      const MULTIPLIER = canvas.width / 750;
      const CROP = 1.25 * canvas.width;
      //console.log(canvas.height);

      overlayImage.onload = () => {
        const overlayWidth = 100 * MULTIPLIER;
        const overlayHeight = 100 * MULTIPLIER;
        const overlayX = canvas.width - overlayWidth - 160 * MULTIPLIER;
        const overlayY = Math.min(canvas.height, CROP + (canvas.height - CROP) / 2) - overlayHeight - 50 * MULTIPLIER;

        

        if (overlayText) {
            const padding = 30 * MULTIPLIER; // Padding around the text
            const radius = 30 * MULTIPLIER; // Radius for the rounded corners
            const backgroundColor = 'rgba(235, 119, 52, .92)'; // Orange with 60% opacity
            const fontSize = 36 * MULTIPLIER;
            
            // Calculate text width and height
            ctx.font = `italic bold ${fontSize}px Lato`;
            const textWidth = ctx.measureText(overlayText).width;
            const textHeight = fontSize; // Assuming font size is 36px
    
            // Positioning
            const usernameY = overlayY + overlayHeight + 24 * MULTIPLIER;
            const backgroundX = canvas.width - textWidth - padding - 147 * MULTIPLIER; // Adjust based on text alignment
            const backgroundY = usernameY - textHeight - padding + 17 * MULTIPLIER;
    
            // Draw the rounded background
            ctx.beginPath();
            ctx.moveTo(backgroundX + radius, backgroundY);
            ctx.lineTo(backgroundX + textWidth + padding, backgroundY);
            ctx.arcTo(backgroundX + textWidth + padding, backgroundY, backgroundX + textWidth + padding, backgroundY + textHeight + padding, radius);
            ctx.lineTo(backgroundX + textWidth + padding, backgroundY + textHeight + padding);
            ctx.arcTo(backgroundX + textWidth + padding, backgroundY + textHeight + padding, backgroundX, backgroundY + textHeight + padding, radius);
            ctx.lineTo(backgroundX, backgroundY + textHeight + padding);
            ctx.arcTo(backgroundX, backgroundY + textHeight + padding, backgroundX, backgroundY, radius);
            ctx.closePath();
            ctx.fillStyle = backgroundColor;
            ctx.fill();
    
            // Draw the text on top of the background
            ctx.font = `italic bold ${fontSize}px Lato`;
            ctx.fillStyle = "#ffffff"; // White color for text
            ctx.shadowColor = 'black'; // Shadow color
            ctx.shadowBlur = 10 * MULTIPLIER; // Shadow blur
            ctx.textAlign = 'right'; // Align text to the right
            
            ctx.fillText(overlayText, canvas.width - 150 * MULTIPLIER, usernameY);
          }

          ctx.drawImage(overlayImage, overlayX, overlayY, overlayWidth, overlayHeight);
    
          uploadImageToFirebase();
        };
    
        // Check if overlay image is already loaded
        if (overlayImage.complete) {
          overlayImage.onload(); // Call onload if already loaded
        }
    };
  };

  const uploadImageToFirebase = async () => {
    const newShare = {
      createdAt: Date.now(),
      createdBy: authUser.uid,
    };

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg'); // Convert canvas to data URL

    try {
      const igDocRef = await addDoc(collection(firestore, "instagram"), newShare);
      const userDocRef = doc(firestore, "users", authUser.uid);
      const imageRef = ref(storage, `instagram/${igDocRef.id}`);

      await updateDoc(userDocRef, { instagram: arrayUnion(igDocRef.id) });
      await uploadString(imageRef, dataUrl, 'data_url');

      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });

      handleShare(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleShare = async (file) => {
    const data = {
      files: [file],
      title: 'Image',
      text: `Follow me at Razzp.com/${authUser.username}`,
    };

    try {
      if (navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
      } else {
        alert('Sharing not supported on this device.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <Box cursor={"pointer"} onClick={prepareImage}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <ChakraImage width="30px" src="/razzp-logo-matte.png" alt="logo" />
    </Box>
  );
};

export default ShareButtonDL;
