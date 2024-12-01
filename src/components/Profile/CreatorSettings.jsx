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
    Text,
    Heading,
    Spinner,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import { addDoc, arrayUnion, collection, doc, updateDoc, getDoc} from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import CreateSubscription from "../Stripe/CreateSubscription";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CreatorSettings = ({ isOpen, onClose }) => {
	//const { isOpen, onOpen, onClose } = useDisclosure();
    const { authUser, fetchUserData } = useAuthStore((state) => ({
		authUser: state.user,
		fetchUserData: state.fetchUserData,
	  }));
	const showToast = useShowToast();
    const [price, setPrice] = useState(authUser?.creatorMessagePrice || ""); // State for handling price
    const [subscriptionPrice, setSubscriptionPrice] = useState(authUser?.creatorSubscriptionPrice || "");
    const [selectedPresetPrice, setSelectedPresetPrice] = useState((price === 5 || price === 10 || price === 15 || price === 20) ? price : null); // State for preset price
    const [selectedPresetSubscription, setSelectedPresetSubscription] = useState((subscriptionPrice === 9 || subscriptionPrice === 15 || subscriptionPrice === 23 || subscriptionPrice === 32) ? subscriptionPrice : null);
    const [isSettingPrices, setIsSettingPrices] = useState(false);
    const userDocRef = doc(firestore, "users", authUser?.uid);
    const [isInitialized, setIsInitialized] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    // useEffect(() => {
    //     if (isInitialized || !authUser) return;

    //     const userDocRef = doc(firestore, "users", authUser.uid);
        
    //     const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
    //         if (snapshot.exists()) {
    //             setUserInfo(snapshot.data());
    //             if (userInfo.creatorSubscriptionPrice === 9 ||
    //                 userInfo.subscriptionPrice === 15 ||
    //                 userInfo.subscriptionPrice === 23 ||
    //                 userInfo.subscriptionPrice === 32
    //             ) {
    //                 setSelectedPresetPrice(userInfo.subscriptionPrice);
    //             } else {
    //                 setSubscriptionPrice(userInfo.subscriptionPrice);
    //             }

    //             if (userInfo.creatorMessagePrice === 9 ||
    //                 userInfo.subscriptionPrice === 15 ||
    //                 userInfo.subscriptionPrice === 23 ||
    //                 userInfo.subscriptionPrice === 32
    //             ) {
    //                 setSelectedPresetPrice(userInfo.subscriptionPrice);
    //             } else {
    //                 setSubscriptionPrice(userInfo.subscriptionPrice);
    //             }
                
    //         } else {
    //             console.error("User document not found.");
    //         }
    //     });

    //     setIsInitialized(true);

    //     // Cleanup the subscription on unmount
    //     return () => unsubscribe();
    // }, [isInitialized, authUser]);

    const handleSetCreatorPrices = async () => {
        if (!authUser || isSettingPrices ) return;

        setIsSettingPrices(true);
        try {


            // console.log(price);
            //console.log(subscriptionPrice);
            
            const parsedSubscriptionPrice = parseFloat(subscriptionPrice) || 0;
            const parsedMessagePrice = parseFloat(price) || 0;

            // Only update Firestore if prices have changed
            // await updateDoc(userDocRef, {
            //     ...(parsedMessagePrice !== authUser.creatorMessagePrice && { creatorMessagePrice: parsedMessagePrice }),
            //     ...(parsedSubscriptionPrice !== authUser.creatorSubscriptionPrice && { creatorSubscriptionPrice: parsedSubscriptionPrice }),
            // });

            // if (parsedMessagePrice !== authUser.creatorMessagePrice) {
            //     await updateDoc(userDocRef, { creatorMessagePrice: parsedMessagePrice });
            // }
            // if (parsedSubscriptionPrice !== authUser.creatorSubscriptionPrice) {
            //     await updateDoc(userDocRef, { creatorSubscriptionPrice: parsedSubscriptionPrice });
            // }

            const userDoc = await getDoc(userDocRef);

            // Return early if the document has not loaded or doesn't exist
            if (!userDoc.exists()) {
                throw new Error("User document not found");
            }

            const userData = userDoc.data();

            // Check for changes in prices and prepare the update object
            // const updates = {};
            // if (parsedMessagePrice !== userData.creatorMessagePrice &&
            //     parsedSubscriptionPrice !== userData.creatorSubscriptionPrice) {
            //     updates.creatorMessagePrice = parsedMessagePrice;
            //     updates.creatorSubscriptionPrice = parsedSubscriptionPrice;
            //     await updateDoc(userDocRef, {
            //     creatorMessagePrice: parsedMessagePrice,
            //     creatorSubscriptionPrice: parsedSubscriptionPrice,
            // });
            
            // }
            
            // else if (parsedMessagePrice !== userData.creatorMessagePrice) {
            //     updates.creatorMessagePrice = parsedMessagePrice;
            //     await updateDoc(userDocRef, {
            //         creatorMessagePrice: parsedMessagePrice,
            //     });
            // }
            // else if (parsedSubscriptionPrice !== userData.creatorSubscriptionPrice) {
            //     updates.creatorSubscriptionPrice = parsedSubscriptionPrice;
            //     await updateDoc(userDocRef, {
            //         creatorSubscriptionPrice: parsedSubscriptionPrice,
            //     });
            // }




            // const updates = {}; // Create an empty object to hold the updates

            // // Check if creatorMessagePrice or creatorSubscriptionPrice need to be updated
            // if (parsedMessagePrice !== userData.creatorMessagePrice) {
            //     updates.creatorMessagePrice = parsedMessagePrice;
            // }

            // if (parsedSubscriptionPrice !== userData.creatorSubscriptionPrice) {
            //     updates.creatorSubscriptionPrice = parsedSubscriptionPrice;
            // }

            // // If there are any updates, apply them to Firestore
            // if (Object.keys(updates).length > 0) {
            //     await updateDoc(userDocRef, updates); // Update all fields at once
            // }

            const updatedUser = {
                ...authUser, // Spread the existing authUser data
                creatorMessagePrice: parsedMessagePrice !== authUser.creatorMessagePrice ? parsedMessagePrice : authUser.creatorMessagePrice,
                creatorSubscriptionPrice: parsedSubscriptionPrice !== authUser.creatorSubscriptionPrice ? parsedSubscriptionPrice : authUser.creatorSubscriptionPrice
            };
            
            // If any fields have been updated, apply the updates to Firestore
            if (
                updatedUser.creatorMessagePrice !== authUser.creatorMessagePrice || 
                updatedUser.creatorSubscriptionPrice !== authUser.creatorSubscriptionPrice
            ) {
                await updateDoc(userDocRef, updatedUser); // Update all fields in Firestore
            }
            

            
            // await updateDoc(userDocRef, {
            //     creatorMessagePrice: parsedMessagePrice,
            //     creatorSubscriptionPrice: parsedSubscriptionPrice,
            // });
            //console.log("test");

            if (parsedSubscriptionPrice !== authUser.creatorSubscriptionPrice) {
                const stripe = await stripePromise;

                const response = await fetch("https://razzp-subscribe-56142959b61f.herokuapp.com/create-creator-subscription", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                    creatorId: authUser.uid,
                    creatorName: authUser.username,
                    subscriptionPrice: Number(parsedSubscriptionPrice),
                    userId: authUser.uid, // Pass the user's UID
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to create subscription");
                }
            }

            showToast("Success", "Prices updated successfully", "success");
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsSettingPrices(false);
            fetchUserData(authUser.uid);
            onClose();
        }
    };

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

      const handleCustomSubscriptionAmountChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ""); 
  
        
        setSubscriptionPrice(value);
        setSelectedPresetSubscription(null); // Deselect preset price
      };
    
    
      // Function to handle preset price buttons
      const handlePriceClick = (value) => {
        setPrice(value.toFixed(2)); // Set the price from the button
        setSelectedPresetPrice(value); // Mark the selected price
        // console.log(price);
      };

      const handleSubscriptionClick = (value) => {
        setSubscriptionPrice(value.toFixed(2));
        setSelectedPresetSubscription(value);
        // console.log(subscriptionPrice);
      }

	

	return (
		<>
			

			<Modal isOpen={isOpen} onClose={onClose} size='xl'>
				<ModalOverlay />

				<ModalContent bg={"black"} border={"1px solid gray"} maxW={{ base: "75vw", md: "300px" }}>
					<ModalHeader>Creator Settings</ModalHeader>
					<ModalCloseButton 
					sx={{
						fontSize: '16px', // Adjust the font size to make the X larger
						color: '#ec9bad', // Set the color to your desired one (e.g., a shade of red)
						_hover: {
						color: '#c85f6e', // Hover color (e.g., red when hovered)
						},
					}}
					/>
					<ModalBody pb={6}>
                        {/* Price buttons and custom input */}
                        <Heading as="h2" size="sm" mb={4}>
                            Set price per message...
                        </Heading>
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
                        <Flex align="center" mt={0} mb={8}>
                        {/* <Text fontWeight="bold" fontSize="sm" mr={2}>
                            Custom:
                        </Text> */}
                        <Input
                            placeholder="Enter custom amount"
                            _placeholder={{ color: 'gray.500' }}
                            value={price && !selectedPresetPrice ? price : ""}
                            onChange={handleCustomAmountChange}
                            size="sm"
                            fontSize={16}
                            bg="white"
                            color="black"
                        />
                        </Flex>
                        </VStack>
                        <Heading as="h2" size="sm" mb={4}>
                            Set Monthly Subscription Price...
                        </Heading>
                        <VStack spacing={4} mt={4}>
                        <Flex gap={4}>
                        <Button
                            onClick={() => handleSubscriptionClick(9.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetSubscription === 9.0 ? "#D4AF37" : "#013220"} // Gold when selected, Very Dark Forest Green when not
                            color={selectedPresetSubscription === 9.0 ? "black" : "white"}
                            borderColor={selectedPresetSubscription === 9.0 ? "#D4AF37" : "#002010"} // Gold for selected, even darker green for unselected
                            _hover={{ backgroundColor: selectedPresetSubscription === 9.0 ? "#C8A21E" : "#001810" }} // Darker metallic forest green on hover
                        >
                            $9
                        </Button>
                        <Button
                            onClick={() => handleSubscriptionClick(15.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetSubscription === 15.0 ? "#D4AF37" : "#013220"} // Gold when selected, Very Dark Forest Green when not
                            color={selectedPresetSubscription === 15.0 ? "black" : "white"}
                            borderColor={selectedPresetSubscription === 15.0 ? "#D4AF37" : "#002010"} // Gold for selected, even darker green for unselected
                            _hover={{ backgroundColor: selectedPresetSubscription === 15.0 ? "#C8A21E" : "#001810" }} // Darker metallic forest green on hover
                        >
                            $15
                        </Button>
                        
                        <Button
                            onClick={() => handleSubscriptionClick(23.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetSubscription === 23.0 ? "#D4AF37" : "#013220"} // Gold when selected, Very Dark Forest Green when not
                            color={selectedPresetSubscription === 23.0 ? "black" : "white"}
                            borderColor={selectedPresetSubscription === 23.0 ? "#D4AF37" : "#002010"} // Gold for selected, even darker green for unselected
                            _hover={{ backgroundColor: selectedPresetSubscription === 23.0 ? "#C8A21E" : "#001810" }} // Darker metallic forest green on hover
                        >
                            $23
                        </Button>
                        <Button
                            onClick={() => handleSubscriptionClick(32.0)}
                            borderRadius={100}
                            size="sm"
                            backgroundColor={selectedPresetSubscription === 32.0 ? "#D4AF37" : "#013220"} // Gold when selected, Very Dark Forest Green when not
                            color={selectedPresetSubscription === 32.0 ? "black" : "white"}
                            borderColor={selectedPresetSubscription === 32.0 ? "#D4AF37" : "#002010"} // Gold for selected, even darker green for unselected
                            _hover={{ backgroundColor: selectedPresetSubscription === 32.0 ? "#C8A21E" : "#001810" }} // Darker metallic forest green on hover
                        >
                            $32
                        </Button>
                        </Flex>

                        {/* Custom price input */}
                        <Flex align="center" mt={0}>
                        {/* <Text fontWeight="bold" fontSize="sm" mr={2}>
                            Custom:
                        </Text> */}
                        <Input
                            placeholder="Enter custom amount"
                            _placeholder={{ color: 'gray.500' }}
                            value={subscriptionPrice && !selectedPresetSubscription ? subscriptionPrice : ""}
                            onChange={handleCustomSubscriptionAmountChange}
                            size="sm"
                            bg="white"
                            color="black"
                        />
                        </Flex>
                        {/* <CreateSubscription creator={authUser}/> */}
                        </VStack>
                        
                            
                        
                    </ModalBody>

					<ModalFooter>
                    <Button mr={3} mt={-3} onClick={handleSetCreatorPrices} disabled={isSettingPrices}>
                        {!isSettingPrices ? (
                            "Set Prices"
                        ) : (
                            
                                <Spinner size="sm" mr={2} />
                            
                        )}
                    </Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreatorSettings;

