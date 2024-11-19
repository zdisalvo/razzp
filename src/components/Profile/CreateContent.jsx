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
    VStack, 
    Text
} from "@chakra-ui/react";
import { CreatePostLogo } from "../../assets/constants";
import { BsFillImageFill } from "react-icons/bs";
import { useRef, useState } from "react";
import usePreviewPaidMedia from "../../hooks/usePreviewPaidMedia";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";
import useUserProfileStore from "../../store/userProfileStore";
import { useLocation } from "react-router-dom";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

const CreateContent = ({ isOpen, onClose }) => {
	//const { isOpen, onOpen, onClose } = useDisclosure();
	const [caption, setCaption] = useState("");
	const mediaRef = useRef(null);
	const { handleMediaChange, selectedFile, setSelectedFile } = usePreviewPaidMedia();
	//const { handleMediaChange, selectedFile, setSelectedFile } = usePreviewMedia();
	const showToast = useShowToast();
	const { isLoading, handleCreatePost } = useCreatePost();
    const [price, setPrice] = useState(10); // State for handling price
    const [selectedPresetPrice, setSelectedPresetPrice] = useState(10.0); // State for preset price

    const handleCustomAmountChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ""); 
  
        // if (value.includes('.')) {
        //   const parts = value.split('.');
        //   if (parts[1].length > 2) { 
        //     parts[1] = parts[1].substring(0, 2); // Limit to two decimal places in real time
        //   }
        //   value = parts.join('.');
        // }
      
        // if (value) {
        //   value = parseFloat(value).toFixed(2); // Convert to dollar figure with two decimal places
        //}
        setPrice(value);
        setSelectedPresetPrice(null); // Deselect preset price
      };
    
      // Function to handle preset price buttons
      const handlePriceClick = (value) => {
        setPrice(value.toFixed(2)); // Set the price from the button
        setSelectedPresetPrice(value); // Mark the selected price
      };

	const handlePostCreation = async () => {
		try {
            await handleCreatePost(selectedFile, caption, price); // Pass price to the createPost function
            onClose();
            //console.log("try");
            setCaption("");
            setSelectedFile(null);
            setPrice(""); // Reset the price after post creation
            setSelectedPresetPrice(null); // Reset the selected preset price
          } catch (error) {
            showToast("Error", error.message, "error");
          }
          //console.log("try, done");
	};

	return (
		<>
			

			<Modal isOpen={isOpen} onClose={onClose} size='xl'>
				<ModalOverlay />

				<ModalContent bg={"black"} border={"1px solid gray"} maxW={{ base: "75vw", md: "300px" }}>
					<ModalHeader>Create Post</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
                        <Textarea
                            placeholder='Post caption...'
							_placeholder={{ color: 'gray.500' }}
							border="1px groove #888888"
							fontSize={16}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />

                        <Input type='file' hidden ref={mediaRef} onChange={handleMediaChange} />

                        <BsFillImageFill
                            onClick={() => mediaRef.current.click()}
                            style={{ marginTop: "15px", marginLeft: "45px", cursor: "pointer" }}
                            size={40}
                        />
                        {/* Price buttons and custom input */}
                        <VStack spacing={4} mt={4}>
                        <Flex gap={4}>
                        <Button
                            onClick={() => handlePriceClick(5.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetPrice === 5.0 ? "#D4AF37" : "#013220"} // Gold when selected, Very Dark Forest Green when not
                            color={selectedPresetPrice === 5.0 ? "black" : "white"}
                            borderColor={selectedPresetPrice === 5.0 ? "#D4AF37" : "#002010"} // Gold for selected, even darker green for unselected
                            _hover={{ backgroundColor: selectedPresetPrice === 5.0 ? "#C8A21E" : "#001810" }} // Darker metallic forest green on hover
                        >
                            $5
                        </Button>
                        <Button
                            onClick={() => handlePriceClick(10.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetPrice === 10.0 ? "#D4AF37" : "#013220"}
                            color={selectedPresetPrice === 10.0 ? "black" : "white"}
                            borderColor={selectedPresetPrice === 10.0 ? "#D4AF37" : "#002010"}
                            _hover={{ backgroundColor: selectedPresetPrice === 10.0 ? "#C8A21E" : "#001810" }}
                        >
                            $10
                        </Button>
                        
                        <Button
                            onClick={() => handlePriceClick(15.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetPrice === 15.0 ? "#D4AF37" : "#013220"}
                            color={selectedPresetPrice === 15.0 ? "black" : "white"}
                            borderColor={selectedPresetPrice === 15.0 ? "#D4AF37" : "#002010"}
                            _hover={{ backgroundColor: selectedPresetPrice === 15.0 ? "#C8A21E" : "#001810" }}
                        >
                            $15
                        </Button>
                        <Button
                            onClick={() => handlePriceClick(20.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetPrice === 20.0 ? "#D4AF37" : "#013220"}
                            color={selectedPresetPrice === 20.0 ? "black" : "white"}
                            borderColor={selectedPresetPrice === 20.0 ? "#D4AF37" : "#002010"}
                            _hover={{ backgroundColor: selectedPresetPrice === 20.0 ? "#C8A21E" : "#001810" }}
                        >
                            $20
                        </Button>
                        </Flex>

                        {/* Custom price input */}
                        <Flex align="center" mt={2}>
              {/* <Text fontWeight="bold" fontSize="sm" mr={2}>
                Custom:
              </Text> */}
              <Input
                placeholder="Enter custom amount"
                _placeholder={{ color: 'gray.500' }}
                value={price && !selectedPresetPrice ? price : ""}
                onChange={handleCustomAmountChange}
                size="sm"
                bg="white"
                color="black"
              />
            </Flex>
                        </VStack>
                        {selectedFile && (
                            <Flex mt={5} w={"full"} position={"relative"} justifyContent={"center"}>
                                {selectedFile.type.startsWith("image/") ? (
                                    <Image src={selectedFile.src} alt='Selected img' />
                                ) : (
                                    <video src={selectedFile.src} playsInline autoPlay style={{ width: "100%" }} />
                                )}
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
						<Button mr={3} onClick={handlePostCreation} isLoading={isLoading}>
							Post
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreateContent;

function useCreatePost() {
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const createPost = usePostStore((state) => state.createPost);
	const setUserProfile = useUserProfileStore((state) => state.setUserProfile);
	const addPost = useUserProfileStore((state) => state.addPost);
	//const setPosts = useU
	//const userProfile = useUserProfileStore((state) => state.userProfile);
	const { pathname } = useLocation();

	const handleCreatePost = async (selectedFile, caption, price) => {
		if (isLoading || !authUser) return;
		if (!selectedFile) throw new Error("Please select an image or video");
	
		setIsLoading(true);
	
		const newPost = {
			caption: caption,
			likes: [],
			crowns: [],
			score: 0,
            paid: true,
            price: parseFloat(price),
            purchased: [],
			comments: [],
			createdAt: Date.now(),
			createdBy: authUser.uid,
		};
	
		try {
			const postDocRef = await addDoc(collection(firestore, "posts"), newPost);
			const userDocRef = doc(firestore, "users", authUser.uid);
			const mediaRef = ref(storage, `posts/${postDocRef.id}`);

			if (authUser) setUserProfile(authUser);
	
			await updateDoc(userDocRef, { posts: arrayUnion(postDocRef.id) });
			await uploadString(mediaRef, selectedFile.src, "data_url");
			const downloadURL = await getDownloadURL(mediaRef);
	
			await updateDoc(postDocRef, { imageURL: downloadURL, mediaType: selectedFile.type });
	
			newPost.imageURL = downloadURL;
			newPost.mediaType = selectedFile.type;

			
	
			if (authUser) createPost({ ...newPost, id: postDocRef.id });
	
			if (authUser) addPost({ ...newPost, id: postDocRef.id });
	
			showToast("Success", "Post created successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, handleCreatePost };
}

// 1- COPY AND PASTE AS THE STARTER CODE FOR THE CRAETEPOST COMPONENT
// import { Box, Flex, Tooltip } from "@chakra-ui/react";
// import { CreatePostLogo } from "../../assets/constants";

// const CreatePost = () => {
// 	return (
// 		<>
// 			<Tooltip
// 				hasArrow
// 				label={"Create"}
// 				placement='right'
// 				ml={1}
// 				openDelay={500}
// 				display={{ base: "block", md: "none" }}
// 			>
// 				<Flex
// 					alignItems={"center"}
// 					gap={4}
// 					_hover={{ bg: "whiteAlpha.400" }}
// 					borderRadius={6}
// 					p={2}
// 					w={{ base: 10, md: "full" }}
// 					justifyContent={{ base: "center", md: "flex-start" }}
// 				>
// 					<CreatePostLogo />
// 					<Box display={{ base: "none", md: "block" }}>Create</Box>
// 				</Flex>
// 			</Tooltip>
// 		</>
// 	);
// };

// export default CreatePost;

// 2-COPY AND PASTE FOR THE MODAL
{
	/* <Modal isOpen={isOpen} onClose={onClose} size='xl'>
				<ModalOverlay />

				<ModalContent bg={"black"} border={"1px solid gray"}>
					<ModalHeader>Create Post</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<Textarea placeholder='Post caption...' />

						<Input type='file' hidden />

						<BsFillImageFill
							style={{ marginTop: "15px", marginLeft: "5px", cursor: "pointer" }}
							size={16}
						/>
					</ModalBody>

					<ModalFooter>
						<Button mr={3}>Post</Button>
					</ModalFooter>
				</ModalContent>
			</Modal> */
}
