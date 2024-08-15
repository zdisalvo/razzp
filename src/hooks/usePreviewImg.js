import { useState } from "react";
import useShowToast from "./useShowToast";
import { checkImageForExplicitContent } from "../utils/imageService"; // Import the function

const usePreviewImg = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const showToast = useShowToast();
	const maxFileSizeInBytes = 10 * 1024 * 1024; // 10MB

	const handleImageChange = async (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith("image/")) {
			if (file.size > maxFileSizeInBytes) {
				showToast("Error", "File size must be less than 10MB", "error");
				setSelectedFile(null);
				return;
			}

			console.log("file");

			const reader = new FileReader();

			reader.onloadend = async () => {
				const imageBase64 = reader.result.split(",")[1]; // Remove data:image/jpeg;base64, part
				try {
					console.log("test");
					const result = await checkImageForExplicitContent(imageBase64);
					if (result === true) {
						showToast("Warning", "Explicit content detected. Please select another image.", "warning");
						setSelectedFile(null);
					} else {
						setSelectedFile(reader.result);
					}
				} catch (error) {
					showToast("Error", "Failed to analyze image content", "error");
					setSelectedFile(null);
				}
			};

			reader.readAsDataURL(file);
		} else {
			showToast("Error", "Please select an image file", "error");
			setSelectedFile(null);
		}
	};

	return { selectedFile, handleImageChange, setSelectedFile };
};

export default usePreviewImg;
