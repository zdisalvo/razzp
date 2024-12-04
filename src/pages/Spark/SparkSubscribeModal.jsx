import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Text, Box, Flex, Modal, ModalOverlay, ModalBody, ModalContent, ModalCloseButton, ModalHeader } from '@chakra-ui/react'; // Assuming you are using Chakra UI
import AddPaymentAndSpark from './AddPaymentAndSpark';
import dayjs from "dayjs";

const SparkSubscribeModal = ({ isOpen, onClose, authUser}) => {
    const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const todayDate = new Date();
    const monthPrior = dayjs(todayDate).subtract(1, "month");
    const monthAfter = dayjs(todayDate).add(1, "month");
    const fmtMonthPrior = monthPrior.format("MM/DD");
    const fmtMonthAfter = monthAfter.format("MMMM DD, YYYY");


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
                <ModalHeader>Subscribe to Spark for $14.95/mo</ModalHeader>
                <ModalBody 
                    px={{ base: "8px", md: "8px" }} 
                    pt={{ base: 5, md: 5 }} 
                    pb={{ base: 4, md: 5 }}
                >
                    <Box mx={5} mb={6}>
                    <h2>Includes...</h2>
                    <Text fontSize="sm" mt={2}>{`❤️ Unlimited likes `}</Text>
                    <Text fontSize="sm">{`🔄 Rematch with expired matches`}</Text>
                    <Text fontSize="sm">{`🎆 See who liked you and match`}</Text>
                    <Text fontSize="sm">{`💫 Renews on ${fmtMonthAfter}`}</Text>
                    </Box>
                    <></>
                    <Text textAlign="center" color="red">This may be age-restricted content</Text>
                    

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
                        <AddPaymentAndSpark authUser={authUser} onClose={onClose} />
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

export default SparkSubscribeModal;
