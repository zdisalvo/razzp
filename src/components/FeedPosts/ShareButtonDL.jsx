import React, { useRef, useState } from 'react';
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase"; // Adjust path as necessary
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useAuthStore from '../../store/authStore';
import { useTab } from '@chakra-ui/react';

const ShareButtonDL = ({ imageUrl, overlayText }) => {
  const canvasRef = useRef(null);
  const authUser = useAuthStore((state) => state.user);
  const imageRef = useRef(null);

  const prepareImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    const overlayImage = new Image();
    const overlayImageUrl = '/razzp-mobile-logo-shadow.png';

    

    baseImage.crossOrigin = 'anonymous'; // Handle cross-origin images if needed
    overlayImage.crossOrigin = 'anonymous';

    baseImage.src = imageUrl;
    overlayImage.src = overlayImageUrl;

    //console.log("test");

    baseImage.onload = () => {
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      ctx.drawImage(baseImage, 0, 0);

      

      // Overlay text
    //   if (overlayText) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(overlayText, canvas.width / 2, canvas.height / 2);
    //   }

      
      // Overlay image
    //   if (overlayImageUrl) {
        overlayImage.onload = () => {
          ctx.drawImage(overlayImage, 50, 50, 100, 100);
          uploadImageToFirebase(); // Call the function to upload the image
         };
    //   } else {
    //     uploadImageToFirebase(); // Call the function to upload the image if no overlay image
    //   }
    };
  };

  const uploadImageToFirebase = async () => {

    //console.log("test");

    const newShare = {
        createdAt: Date.now(),
        createdBy: authUser.uid,
    };

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg'); // Convert canvas to data URL
    const imageRef = ref(storage, 'instagram/overlay-image.jpg'); // Firebase Storage path
    


    //await uploadString(imageRef, 'instagram/overlay-image.jpg', "data_url");


    try {
        //console.log("test");
    //  const igDocRef = await addDoc(collection(firestore, "instagram"), newShare);
     
    //  const userDocRef = doc(firestore, "users", authUser.uid);
    //  const imageRef = ref(storage, `instagram/${igDocRef.id}`);
    //   // Upload the image
    //   await updateDoc(userDocRef, { instagram: arrayUnion(igDocRef.id) });
      await uploadString(imageRef, dataUrl, 'data_url');
      
      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);

      const response = await fetch(downloadURL);
      const blob = await response.blob();

      // Create a new File object
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
      text: 'Check out this image!',
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

      // Open the Instagram app or website with the image URL
//       if (file)
//         openInstagramWithImage(file);
//     } catch (error) {
//       console.error('Error uploading image:', error);
//     }
//   };

  const openInstagramWithImage = (imageUrl) => {
    const instagramWebUrl = `https://www.instagram.com/`;

    //Create an anchor element and set it to the image URL
    // const anchor = document.createElement('a');
    // anchor.href = imageUrl;
    // anchor.download = 'shared-image.jpg'; // Set default file name
    // document.body.appendChild(anchor);
    // anchor.click();
    // document.body.removeChild(anchor);

    // anchor.target = '_blank';
    // anchor.click(); // Trigger the download or open in new tab

    const instagramAppUrl = `instagram://library?AssetPath=${encodeURIComponent(imageUrl)}`;
      
      window.location.href = instagramAppUrl;
    
    // Open Instagram in a new tab as a fallback
    // setTimeout(() => {
    //   window.open(instagramWebUrl, '_blank');
    // }, 500);
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={prepareImage}>Prepare and Share to Instagram</button>
    </div>
  );
};

export default ShareButtonDL;
