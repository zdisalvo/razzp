import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewMedia = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const showToast = useShowToast();
	const maxFileSizeInBytes = 50 * 1024 * 1024; // 50MB

	const handleMediaChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith("image/") || file.type.startsWith("video/")) {
			if (file.size > maxFileSizeInBytes) {
				showToast("Error", "File size must be less than 10MB", "error");
				setSelectedFile(null);
				return;
			}
			const reader = new FileReader();

			reader.onloadend = () => {
				setSelectedFile({ src: reader.result, type: file.type });
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
