import React from 'react';

const ShareButton = ({ imageUrl }) => {
  const shareToInstagramApp = () => {
    const instagramAppUrl = `instagram://library?AssetPath=${encodeURIComponent(imageUrl)}`;
    const instagramWebUrl = `https://www.instagram.com/`;

    // Attempt to open the Instagram app
    window.location.href = instagramAppUrl;

    // Fallback to the Instagram website if the app isn't installed
    // setTimeout(() => {
    //   window.open(instagramWebUrl, '_blank');
    // }, 500);
  };

  return (
    <button disabled={isLoading} onClick={shareToInstagramApp}>
      Share to Instagram
    </button>
  );
};

export default ShareButton;
