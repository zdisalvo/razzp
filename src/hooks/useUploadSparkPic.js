import {
	Box,
	Button,
	CloseButton,
	Flex,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Textarea,
	Tooltip,
	useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../../hooks/usePreviewImg";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";
import useUserProfileStore from "../../store/userProfileStore";
import useSparkImageStore from "../store/sparkImageStore";
import useSparkStore from "../store/sparkProfileStore";
import { useLocation } from "react-router-dom";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

const CreateSparkPic = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [caption, setCaption] = useState("");
	const imageRef = useRef(null);
	const { handleImageChange, selectedFile, setSelectedFile } = usePreviewImg();
	const showToast = useShowToast();
	const { isLoading, handleCreatePost } = useUploadSparkPic();

	const handleUploadImageCreation = async () => {
		try {
			await handleUploadPic(selectedFile);
			onClose();
			setSelectedFile(null);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.uploadedImages.length > 7) {
          alert("You can only upload up to 7 photos.");
          return;
        }
      
        const newPhotos = files.map(file => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          return new Promise((resolve) => {
            reader.onloadend = () => {
              resolve(reader.result);
            };
          });
        });
      
        Promise.all(newPhotos).then((uploadedImages) => {
          setFormData((prevState) => ({
            ...prevState,
            uploadedImages: [...prevState.uploadedImages, ...uploadedImages],
          }));
        });
      };

	return (
            <>
            <FormControl id="uploadedImages">
            <FormLabel>Profile Pictures</FormLabel>
            <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
            />
            <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                {formData.photos.map((photo, index) => (
                <Image
                    key={index}
                    src={photo}
                    alt={`Profile Picture ${index + 1}`}
                    boxSize="100px"
                    borderRadius="md"
                />
                ))}
            </Box>
            <Button mr={3} onClick={handleUploadImageCreation} isLoading={isLoading}>
							Post
						</Button>
            </FormControl>
            </>
        );
    };

export default CreateSparkPic

function useUploadSparkPic() {
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const createPic = useSparkImageStore((state) => state.createPic);
	const addPic = useSparkStore((state) => state.addPic);
	const sparkProfile = useSparkStore((state) => state.sparkProfile);
	const { pathname } = useLocation();

	const handleUploadPic = async (selectedFile) => {
		if (isLoading || !authUser || !sparkProfile) return;
		if (!selectedFile) throw new Error("Please select an image");
		setIsLoading(true);
		const newPic = {
			createdAt: Date.now(),
			createdBy: authUser.uid,
		};

		try {
			const picDocRef = await addDoc(collection(firestore, "pics"), newPic);
			const sparkUserDocRef = doc(firestore, "spark", authUser.uid);
			const imageRef = ref(storage, `pics/${picDocRef.id}`);

			await updateDoc(sparkUserDocRef, { uploadedImages: arrayUnion(picDocRef.id) });
			await uploadString(imageRef, selectedFile, "data_url");
			const downloadURL = await getDownloadURL(imageRef);

			await updateDoc(picDocRef, { imageURL: downloadURL });

			newPic.imageURL = downloadURL;

			if (sparkProfile.uid === authUser.uid) createPic({ ...newPic, id: picDocRef.id });

			if (sparkProfile.uid === authUser.uid) addPic({ ...newPic, id: picDocRef.id });

			showToast("Success", "Image uploaded successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, handleUploadPic };
}

