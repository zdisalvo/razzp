import {
    Avatar,
    Button,
    Center,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Textarea
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import usePreviewImg from "../../hooks/usePreviewMedia";
import useEditProfile from "../../hooks/useEditProfile";
import useShowToast from "../../hooks/useShowToast";
import { firestore } from "../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";


const EditProfile = ({ isOpen, onClose }) => {
    const authUser = useAuthStore((state) => state.user);
    const fileRef = useRef(null);
    const { handleImageChange, selectedFile, setSelectedFile } = usePreviewImg();
    const { isUpdating, editProfile } = useEditProfile();
    const showToast = useShowToast();
    const [isEdited, setIsEdited] = useState(false);
	const initialUsername = authUser.username;

    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        bio: "",
    });

    useEffect(() => {
        if (authUser && !isEdited) {
            setFormData({
                username: authUser.username || "",
                fullName: authUser.fullName || "",
                bio: authUser.bio || "",
            });
        }
    }, [authUser, isEdited]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

		if (name === "username") {
			setFormData((prevState) => ({
				...prevState,
				[name]: value.trim(),
			}));
		} else {
			setFormData((prevState) => ({
				...prevState,
				[name]: value,
			}));
		}

		

        if (name === "username" || name === "fullName" || name === "bio") {
            setIsEdited(true);
        }
    };

    const handleEditProfile = async () => {
        try {
			
			if (formData.username !== initialUsername) {
			
				const usersRef = collection(firestore, "users");
	
				const q = query(usersRef, where("username", "==", formData.username));
				const querySnapshot = await getDocs(q);

				//console.log(formData.username);
	
				if (!querySnapshot.empty || formData.username === "notifications"
                    || formData.username === "top5" || formData.username === "auth"
                    || formData.username === "spark" || formData.username === "messages"
                    || formData.username === "search" || formData.username === "blocked"
                ) {
					showToast("Error", "This username is taken", "error");
					return;
				}
			}

			await editProfile(formData, selectedFile);
			

            setSelectedFile(null);
            onClose();
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={"black"} border={"1px solid gray"} maxW={{ base: "90vw", md: "400px" }} px={0} my={0}>
                <ModalHeader mb={0}>Edit Profile</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={5} pt={1}>
                    <Flex bg={"black"}>
                        <Stack spacing={3} w={"full"} bg={"black"} p={0} my={0}>
                            <FormControl>
                                <Stack direction={["row", "row"]} spacing={6} my={0}>
                                    <Center mt={0}>
                                        <Avatar
                                            size='xl'
                                            src={selectedFile || authUser.profilePicURL}
                                            border={"2px solid white"}
                                        />
                                    </Center>
                                    <Center w='full'>
                                        <Button size="sm" w='full' onClick={() => fileRef.current.click()}>
                                            Edit Picture
                                        </Button>
                                    </Center>
                                    <Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
                                </Stack>
                            </FormControl>

                            <FormControl id="fullName">
                                <FormLabel fontSize={"sm"}>Full Name</FormLabel>
                                <Input
                                    name="fullName"
                                    placeholder={"Full Name"}
                                    size={"sm"}
                                    type={"text"}
                                    fontSize={16}
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    _focus={{ 
                                        borderColor: 'transparent',
                                        boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)'
                                    }}
                                    maxLength={40}
                                />
                            </FormControl>

                            <FormControl id="username">
                                <FormLabel fontSize={"sm"}>Username</FormLabel>
                                <Input
                                    name="username"
                                    placeholder={"Username"}
                                    size={"sm"}
                                    type={"text"}
                                    fontSize={16}
                                    value={formData.username.toLocaleLowerCase()}
                                    onChange={handleInputChange}
                                    _focus={{ 
                                        borderColor: 'transparent',
                                        boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)'
                                    }}
                                    maxLength={20}
                                />
                            </FormControl>

                            <FormControl id="bio">
                                <FormLabel fontSize={"sm"}>Bio</FormLabel>
                                <Textarea
                                    name="bio"
                                    placeholder={"Bio"}
                                    fontSize={16}
                                    size={"sm"}
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    width="100%"
                                    resize="vertical"
                                    rows={3}
                                    _focus={{ 
                                        borderColor: 'transparent',
                                        boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)'
                                    }}
                                    maxLength={200}
                                />
                            </FormControl>

                            <Stack spacing={6} direction={["row", "row"]}>
                                <Button
                                    bg={"red.400"}
                                    color={"white"}
                                    w='full'
                                    size='sm'
                                    _hover={{ bg: "red.500" }}
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    bg={"blue.400"}
                                    color={"white"}
                                    size='sm'
                                    w='full'
                                    _hover={{ bg: "blue.500" }}
                                    onClick={handleEditProfile}
                                    isLoading={isUpdating}
                                >
                                    Submit
                                </Button>
                            </Stack>
                        </Stack>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default EditProfile;
