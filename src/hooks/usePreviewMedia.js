import { useState } from "react";
import useShowToast from "./useShowToast";
import { checkImageForExplicitContent } from "../utils/imageService";

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
					const result = await checkImageForExplicitContent(base64Image);
					console.log(result);
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
