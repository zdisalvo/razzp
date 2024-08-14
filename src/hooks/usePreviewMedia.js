import { useState } from "react";
import useShowToast from "./useShowToast";
import { checkImageForExplicitContent } from "../utils/imageService";
import { checkVideoForExplicitContent } from "../utils/videoService";

const usePreviewMedia = () => {
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
				const base64Image = reader.result.split(',')[1];
				
				try {
					let result;

					if (file.type.startsWith("image/")) {
						// Check for explicit content in images
						result = await checkImageForExplicitContent(base64Image);
					} else if (file.type.startsWith("video/")) {
						// Check for explicit content in videos
						const videoUri = URL.createObjectURL(file); // Temporarily create a URI for the video
						result = await checkVideoForExplicitContent(videoUri);
					}
					//console.log(result);


					if (result === 'Explicit content detected') {
		
						showToast("Warning", "This image/video contains explicit content and will not be uploaded", "warning");
						setSelectedFile(null);
					} else {
						setSelectedFile({ src: reader.result, type: file.type });
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
