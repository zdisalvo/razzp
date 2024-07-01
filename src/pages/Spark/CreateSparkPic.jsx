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
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import { BsFillImageFill } from "react-icons/bs";
import { useRef, useState, useEffect } from "react";
import usePreviewImg from "../../hooks/usePreviewImg";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";
import useUserProfileStore from "../../store/userProfileStore";
import useSparkImageStore from "../../store/sparkImageStore";
import useSparkProfileStore from "../../store/sparkProfileStore";
import { useLocation } from "react-router-dom";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import {SparkImageLogo} from "../../assets/constants";

const CreateSparkPic = ({onUpload}) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
    //const [formData, setFormData] = useState({ uploadedImages: [] });
	const imageRef = useRef(null);
	const { handleImageChange, selectedFile, setSelectedFile } = usePreviewImg();
	const showToast = useShowToast();
	const { isLoading, handleUploadPic } = useUploadSparkPic();
    //const sparkProfile = useSparkProfileStore((state) => state.sparkProfile);

	const handleUploadImageCreation = async () => {
		try {
			const uploadedImage = await handleUploadPic(selectedFile);
			onClose();
			setSelectedFile(null);
            if (onUpload) {
                onUpload(uploadedImage);
              }
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

    // const handleFileChange = (e) => {
    //     const files = Array.from(e.target.files);
    //     if (files.length + sparkProfile.uploadedImages.length > 7) {
    //       alert("You can only upload up to 7 photos.");
    //       return;
    //     }
      
    //     const newPhotos = files.map(file => {
    //       const reader = new FileReader();
    //       reader.readAsDataURL(file);
    //       return new Promise((resolve) => {
    //         reader.onloadend = () => {
    //           resolve(reader.result);
    //         };
    //       });
    //     });
      
        // Promise.all(newPhotos).then((uploadedImages) => {
        //   setFormData((prevState) => ({
        //     ...prevState,
        //     uploadedImages: [...prevState.uploadedImages, ...uploadedImages],
        //   }));
        // });
    //   };

	return (

        <>
        <Tooltip
            hasArrow
            placement='center'
            ml={2}
            openDelay={500}
            display={{ base: "block", md: "none" }}
        >
            <Flex
                alignItems={"center"}
                gap={1}
                //hover={{ bg: "orange.400" }}
                _hover={{ bg: "orange.400" }} // Color on hover
                transition="color 0.3s" // Optional: smooth transition
                borderRadius={1}
                p={0}
                md={2}
                //w={{ base: 2, md: "full" }}
                justifyContent={{ base: "center", md: "flex-start" }}
                onClick={onOpen}
            >
                <SparkImageLogo />
                
                {/* <Box display={{ base: "none", md: "none" }}></Box> */}
            </Flex>
        </Tooltip>

        <Modal isOpen={isOpen} onClose={onClose} size='md'>
            <ModalOverlay />

            <ModalContent bg={"black"} border={"1px solid gray"}>
                <ModalHeader>Upload Picture</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    

                    <Input type='file' hidden ref={imageRef} onChange={handleImageChange} />

                    <BsFillImageFill
                        onClick={() => imageRef.current.click()}
                        style={{ marginTop: "15px", marginLeft: "5px", cursor: "pointer" }}
                        size={16}
                    />
                    {selectedFile && (
                        <Flex mt={5} w={"full"} position={"relative"} justifyContent={"center"}>
                            <Image src={selectedFile} 
                                alt='Selected img' 
                                boxSize={{base: "50vw", md: "200px"}} // Set the size to 100px
                                objectFit="cover" // Ensure the image covers the box while maintaining aspect ratio
                                borderRadius="md" // Optional: add rounded corners
                            />
                            <CloseButton
                                position={"absolute"}
                                top={2}
                                right={2}
                                onClick={() => {
                                    setSelectedFile(null);
                                }}
                            />
                        </Flex>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button mr={3} onClick={handleUploadImageCreation} isLoading={isLoading}>
                        Add
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>

            // <>
            // <FormControl id="uploadedImages">
            // <FormLabel>Profile Pictures</FormLabel>
            // <Input
            //     type="file"
            //     accept="image/*"
            //     multiple
            //     // onChange={handleFileChange}
            //     //onChange={handleUploadPic}
            // />
            // {/* <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
            //     {formData.uploadedImages.map((photo, index) => (
            //     <Image
            //         key={index}
            //         src={photo}
            //         alt={`Profile Picture ${index + 1}`}
            //         boxSize="100px"
            //         borderRadius="md"
            //     />
            //     ))}
            // </Box> */}
            // <Button mr={3} onClick={handleUploadImageCreation} isLoading={isLoading}>
			// 				Post
			// 			</Button>
            // </FormControl>
            // </>
        );
    };

export default CreateSparkPic

function useUploadSparkPic() {
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const createPic = useSparkImageStore((state) => state.createPic);
	const addPic = useSparkProfileStore((state) => state.addPic);
	const { sparkProfile, isLoading: sparkProfileLoading, fetchSparkProfile } = useSparkProfileStore((state) => state);
	const { pathname } = useLocation();

    useEffect(() => {
        if (authUser) {
            fetchSparkProfile(authUser.uid);
        }
    }, [authUser, fetchSparkProfile]);

	const handleUploadPic = async (selectedFile) => {
        console.log("before");
		if (isLoading || sparkProfileLoading || !authUser || !sparkProfile) return;
        console.log("after");
		if (!selectedFile) throw new Error("Please select an image");
		setIsLoading(true);
		const newPic = {
			createdAt: Date.now(),
			createdBy: authUser.uid,
		};

		try {
			const picDocRef = await addDoc(collection(firestore, "pics"), newPic);
			const sparkUserDocRef = doc(firestore, "spark", sparkProfile.uid);
			const imageRef = ref(storage, `pics/${picDocRef.id}`);

			await updateDoc(sparkUserDocRef, { uploadedImages: arrayUnion(picDocRef.id) });
			await uploadString(imageRef, selectedFile, "data_url");
			const downloadURL = await getDownloadURL(imageRef);

			await updateDoc(picDocRef, { imageURL: downloadURL });

			newPic.imageURL = downloadURL;

			if (sparkProfile.uid === authUser.uid) createPic({ ...newPic, id: picDocRef.id });

			if (sparkProfile.uid === authUser.uid) addPic({ ...newPic, id: picDocRef.id });

			showToast("Success", "Image uploaded successfully", "success");
            ////
            return { ...newPic, id: picDocRef.id, imageURL: downloadURL };
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, handleUploadPic };
}

