import React, { useRef } from 'react';

const ShareButtonOverlay = ({ imageUrl, overlayText }) => {
  const canvasRef = useRef(null);
  console.log("test");

  const prepareImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    const overlayImage = new Image();
    const overlayImageUrl = "/razzp-mobile-logo-shadow.png"

    //console.log(imageUrl);

    baseImage.src = imageUrl;
    overlayImage.src = overlayImageUrl;

    baseImage.onload = () => {
        console.log('base');
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      ctx.drawImage(baseImage, 0, 0);
    

      // Overlay text
      if (overlayText) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(overlayText, canvas.width / 2, canvas.height / 2);
        console.log("text");
      }

      // Overlay image
      if (true) {
        overlayImage.onload = () => {
          ctx.drawImage(overlayImage, 50, 50, 100, 100); // Adjust the position and size as needed
          console.log("overlay");
          shareToInstagramApp();
          //console.log("overlay");
        };
      } else {
        shareToInstagramApp();
        console.log("test");
      }
    };

  };

  const shareToInstagramApp = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg');
    const instagramAppUrl = `instagram://library?AssetPath=${encodeURIComponent(dataUrl)}`;
    const instagramWebUrl = `https://www.instagram.com/`;

    // Attempt to open the Instagram app
    window.location.href = instagramAppUrl;

    // Fallback to the Instagram website if the app isn't installed
    // setTimeout(() => {
    //   window.open(instagramWebUrl, '_blank');
    // }, 500);
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button disabled={isLoading} onClick={prepareImage}>Share to Instagram</button>
    </div>
  );
};

export default ShareButtonOverlay;
