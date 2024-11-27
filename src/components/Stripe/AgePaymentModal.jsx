import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Text, Box, Flex, Modal, ModalOverlay, ModalBody, ModalContent, ModalCloseButton, ModalHeader } from '@chakra-ui/react'; // Assuming you are using Chakra UI
import usePurchasePost from "../../hooks/usePurchasePost";
import AddPaymentAndPost from './AddPaymentAndPost';


const AgePaymentModal = ({ isOpen, onClose, post, authUser, creatorProfile }) => {
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
    const { handlePurchase } = usePurchasePost();
    let stripeButton = null; // Reference to the Stripe button

    

    const handleCheckboxChange = (event) => {
        setIsAgeConfirmed(event.target.checked);
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
                <ModalHeader>Unlock Content for ${post.price}</ModalHeader>
                <ModalBody 
                    px={{ base: "8px", md: "8px" }} 
                    pt={{ base: 5, md: 5 }} 
                    pb={{ base: 4, md: 5 }}
                >
                    <></>
                    <Text textAlign="center" color="red">This is age-restricted content</Text>
                    

                    {/* Checkbox for age confirmation */}
                    <Box display="flex" justifyContent="center" alignItems="center" mt="20px">
                        <Checkbox onChange={handleCheckboxChange} isChecked={isAgeConfirmed}>
                            <Text textAlign="center">
                                I confirm I am at least 18 years old
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
                    <Box mx="50px">
                    {isAgeConfirmed && (
                        <AddPaymentAndPost post={post} creatorProfile={creatorProfile} authUser={authUser} onClose={onClose}/>
                    )}
                    </Box>

                    {/* Close modal button */}
                    <Flex flexDirection="column" alignItems="center">
                    <Button onClick={onClose} mt="10px" textAlign="center">
                        Cancel
                    </Button>
                    </Flex>
                    
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AgePaymentModal;
