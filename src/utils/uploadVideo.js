import { useState } from 'react';

const uploadVideoAndCheckContent = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  //https://videointel-wvagimxpzq-wl.a.run.app

  //https://us-west2-razz-p.cloudfunctions.net/videoIntel/videoIntel
  try {
    const response = await fetch('https://videointel-wvagimxpzq-wl.a.run.app/videoIntel', {
      method: 'POST',
      body: formData,
    //   headers: {
    //         'Content-Type': 'multipart/form-data'  // Adjust the content type if needed
    //     },
        //contentType: "application/json",
        dataType: "json",
        //data: " { \"Name\" : \"AA\" } ",
        //async: false,
      crossorigin: true,    
      mode: 'cors'

      //mode: 'no-cors',
    });

    // if (!response.ok) {
    //   throw new Error('Network response was not ok');
    // }

    // if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    // }

    //console.log(response);

    // let data;
    //     try {
    //         data = await response.json();
    //     } catch (error) {
    //         throw new Error('Failed to parse JSON response: ' + error.message);
    //     }

    const result = await response.json();
    const returnValue = result.explicit_content_detected;
    
    return returnValue;
  } catch (error) {
    console.error('Error uploading video and checking content:', error);
    throw new Error('Failed to check video content');
  }
};

export const useCheckVideoContent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const checkVideoForExplicitContent = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const explicitContentDetected = await uploadVideoAndCheckContent(file);
      //console.log(explicitContentDetected);
      setResult(explicitContentDetected);
      console.log(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { checkVideoForExplicitContent, result, error, loading };
};
