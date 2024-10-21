import { useState } from "react";
import useShowToast from "./useShowToast";
import { checkImageForExplicitContent } from "../utils/imageService";

const usePreviewPaidMedia = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const showToast = useShowToast();
  const maxFileSizeInBytes = 50 * 1024 * 1024; // 50MB

  

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
            
          } else if (file.type.startsWith("video/")) {
            showToast("Starting video processing...");
          }

          
        setSelectedFile({ src: fileContent, type: file.type });
          
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

export default usePreviewPaidMedia;
