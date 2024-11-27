import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Text, Box, Flex, Modal, ModalOverlay, ModalBody, ModalContent, ModalCloseButton, ModalHeader } from '@chakra-ui/react'; // Assuming you are using Chakra UI
//import AddPaymentAndSubscribe from './AddPaymentAndSubscribe';
import dayjs from "dayjs";
import axios from "axios";

const CancelSubscription = ({ isOpen, onClose, userProfile, authUser }) => {
    const [cancelConfirmed, setCancelConfirmed] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const todayDate = new Date();
    const monthPrior = dayjs(todayDate).subtract(1, "month");
    const monthAfter = dayjs(todayDate).add(1, "month");
    const fmtMonthPrior = monthPrior.format("MM/DD");
    const fmtMonthAfter = monthAfter.format("MMMM DD, YYYY");
    const [expirationDate, setExpirationDate] = useState("");
    const [isInitialized, setIsInitalized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const userId = authUser.uid;
    const creatorId = userProfile.uid;

    //console.log(userId);

    const handleCheckboxChange = (event) => {
        setCancelConfirmed(event.target.checked);
    };

    useEffect (() => {
		if (!authUser || !userProfile || isInitialized)
			return;
        const subscription = authUser.subscriptions?.find(
            (sub) => sub.creatorId === userProfile.uid
          );
          
        const expirationDateVal = subscription ? subscription.expirationDate : null;

        const expirationDateRaw = dayjs(expirationDateVal.toDate());
        const expirationDateFormat = expirationDateRaw.format("MM/DD/YYYY")

        setExpirationDate(expirationDateFormat);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
      
        try {
          // Send cancel subscription request
          const response = await axios.post(
            "https://razzp-subscribe-56142959b61f.herokuapp.com/cancel-subscription",
            {
              userId,
              creatorId,
            }
          );
      
          if (response.status === 200) {
            // Check if the backend response indicates success
            if (response.data.message === "Subscription canceled successfully.") {
              // Handle successful cancellation (e.g., update Firestore, UI)
              // addSubscriptionToFirestore();
              onClose();  // Close the modal or UI component
            } else {
              alert("Subscription cancellation failed: " + response.data.error);
            }
          } else {
            alert("Subscription failed. Status: " + response.status);
          }
        } catch (error) {
          setErrorMessage(error.message || "An error occurred while canceling the subscription.");
        } finally {
          setLoading(false);
        }
      };


    

    return (
        <Modal isOpen={isOpen} onClose={onClose} p={0}>
            <ModalOverlay />
            <ModalContent 
                bg={"black"} 
                border={"1px solid gray"} 
                maxW={{ base: "90vw", md: "400px" }}  
                px={{ base: "8px", md: "8px" }} 
                pt={3} 
                pb={4}
            >
                <ModalCloseButton />
                <ModalHeader>Cancel Subscription for {userProfile?.username}</ModalHeader>
                <ModalBody 
                    px={{ base: "8px", md: "8px" }} 
                    pt={{ base: 5, md: 5 }} 
                    pb={{ base: 4, md: 5 }}
                >
                    <Box mx={5} mb={6}>
                    <h2>When cancelling...</h2>
                    <Text fontSize="sm" mt={2}>{`🔓 You retain exclusive access through ${expirationDate}`}</Text>
                    <Text fontSize="sm">{`❌ Your card will not be charged on ${expirationDate}`}</Text>
                    </Box>
                    <></>
                    

                    {/* Checkbox for age confirmation */}
                    <Box display="flex" justifyContent="center" alignItems="center" mt="20px">
                        <Checkbox onChange={handleCheckboxChange} isChecked={cancelConfirmed}>
                            <Text textAlign="center">
                                I wish to cancel
                            </Text>
                        </Checkbox>
                    </Box>
                    {/* <Flex flexDirection="column" alignItems="center" mt="20px"> */}
                    {/* Show payment request button only if age is confirmed */}
                    {/* {isAgeConfirmed && post.price !== undefined && (
                        <Button 
                            id="payment-request-button" 
                            mt="20px" 
                            w="auto"
                        >
                            Unlock for ${post.price}
                        </Button>
                    )} */}
                    {cancelConfirmed && (
                        <Box display="flex" justifyContent="center" alignItems="center" mt="20px">
                    
                        <Button   
                            size="sm"
                            mt={1}
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >{loading
                            ? "Processing cancellation..."
                            : `Cancel Subscription`}
                            </Button>
                            {errorMessage && <div>{errorMessage}</div>}
                            </Box>
                    )}
                    

                    {/* Close modal button */}
                    <Flex flexDirection="column" alignItems="center">
                    <Button size="sm" onClick={onClose} mt="20px" textAlign="center">
                        Keep Subscription
                    </Button>
                    </Flex>
                    
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CancelSubscription;
