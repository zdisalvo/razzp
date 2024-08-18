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
				const fileContent = reader.result;

				try {
					let result;

					if (file.type.startsWith("image/")) {
						// Extract base64 content from the image and check for explicit content
						const base64Image = fileContent.split(',')[1];
						result = await checkImageForExplicitContent(base64Image);
					} else if (file.type.startsWith("video/")) {
						// Use the Data URL directly for checking explicit content in videos
						showToast("starting video");
						if (fileContent)
							showToast("file content present");
						result = await checkVideoForExplicitContent(fileContent);
					}

					if (result === true) {
						console.log(result);
						showToast("Warning", "This image/video contains explicit content and will not be uploaded", "warning");
						setSelectedFile(null);
					} else {
						setSelectedFile({ src: file, type: file.type });
					}
				} catch (error) {
					showToast("Error", "Error checking content", "error");
					setSelectedFile(null);
				}
			};

			// Read the file content as a Data URL
			reader.readAsDataURL(file);
		} else {
			showToast("Error", "Please select an image or video file", "error");
			setSelectedFile(null);
		}
	};

	return { selectedFile, handleMediaChange, setSelectedFile };
};

export default usePreviewMedia;
