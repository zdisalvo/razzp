import React, { useRef } from 'react';
import { Box, Image as ChakraImage } from "@chakra-ui/react";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase"; // Adjust path as necessary
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useAuthStore from '../../store/authStore';

const ShareButtonDL = ({ imageUrl, overlayText }) => {
  const canvasRef = useRef(null);
  const authUser = useAuthStore((state) => state.user);

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

      overlayImage.onload = () => {
        const overlayWidth = 100;
        const overlayHeight = 100;
        const overlayX = canvas.width - overlayWidth - 20;
        const overlayY = canvas.height - overlayHeight - 50;

        ctx.drawImage(overlayImage, overlayX, overlayY, overlayWidth, overlayHeight);

        // if (overlayText) {
        //   const textSize = 50;
        //   ctx.font = `${textSize}px Arial`;
        //   ctx.fillStyle = 'white';
        //   ctx.textAlign = 'center';
        //   ctx.fillText(overlayText, overlayX + overlayWidth / 2, overlayY + overlayHeight / 2 + textSize / 2 + 5);
        // }

        // Draw username below the overlay image
        const usernameY = overlayY + overlayHeight + 24;
        ctx.font = 'italic bold 36px Lato';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'pink';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'right';
        ctx.fillText(authUser.username, canvas.width - 10, usernameY);

        uploadImageToFirebase();
      };

      // Check if overlay image is already loaded
      if (overlayImage.complete) {
        const overlayWidth = 100;
        const overlayHeight = 100;
        const overlayX = canvas.width - overlayWidth - 20;
        const overlayY = canvas.height - overlayHeight - 50;

        ctx.drawImage(overlayImage, overlayX, overlayY, overlayWidth, overlayHeight);

        // if (overlayText) {
        //   const textSize = 30;
        //   ctx.font = `${textSize}px Arial`;
        //   ctx.fillStyle = 'white';
        //   ctx.textAlign = 'center';
        //   ctx.fillText(overlayText, overlayX + overlayWidth / 2 - 20, overlayY + overlayHeight / 2 + textSize / 2 + 15);
        // }

        // Draw username below the overlay image
        if (overlayText) {
        const usernameY = overlayY + overlayHeight + 24;
        ctx.font = 'italic bold 36px Lato';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'pink';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'right';
        ctx.fillText(overlayText, canvas.width - 10, usernameY);
        }

        uploadImageToFirebase();
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
