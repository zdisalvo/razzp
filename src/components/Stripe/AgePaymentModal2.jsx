import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button, Checkbox, Text, Box, Flex, Modal, ModalOverlay, ModalBody, ModalContent, ModalCloseButton, ModalHeader } from '@chakra-ui/react'; // Assuming you are using Chakra UI
import usePurchasePost from "../../hooks/usePurchasePost";

const stripePromise = loadStripe('pk_test_51QDDRNF8INFI9spHDcvYT97lRNENvUzlVE7IycQPD53LOr9vmGLXpjfx1aLnW48niZ4EJg0dcZTtYFqm2Ssnwxhi00wHKGaHTv'); // Your Stripe public key

const AgePaymentModal = ({ isOpen, onClose, post, creatorProfile }) => {
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
    const { handlePurchase } = usePurchasePost();
    let stripeButton = null; // Reference to the Stripe button

    useEffect(() => {
        const initPaymentRequest = async () => {
            const stripe = await stripePromise;

            // Create a Payment Request
            const request = stripe.paymentRequest({
                country: 'US', // Use your country code
                currency: 'usd',
                total: {
                    label: 'One-Time Payment',
                    amount: post.price * 100, // Amount in cents, assumes `post.price` is in dollars
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            // Check if the Payment Request API is available
            const canMakePayment = await request.canMakePayment();
            if (canMakePayment) {
                setPaymentRequest(request);
            } else {
                console.log('Payment Request API not available.');
            }
        };

        if (isOpen) {
            initPaymentRequest();
        }
    }, [isOpen, post.price]);

    useEffect(() => {
        const setupPaymentButton = async () => {
            if (paymentRequest && isAgeConfirmed) {
                const stripe = await stripePromise;
                const prButton = document.getElementById('payment-request-button');

                if (prButton && !stripeButton) {
                    const elements = stripe.elements();
                    stripeButton = elements.create('paymentRequestButton', {
                        paymentRequest: paymentRequest,
                    });

                    stripeButton.mount(prButton);

                    // Handle the token received from the payment request
                    paymentRequest.on('token', async (event) => {
                        try {
                            const response = await fetch('/your-backend-endpoint', { // Replace with your backend endpoint
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ token: event.token.id }),
                            });

                            if (response.ok) {
                                event.complete('success');
                                handlePurchase(post, post.price, creatorProfile);
                                onClose();
                                console.log('Payment succeeded!');
                            } else {
                                event.complete('fail');
                                console.error('Payment failed.');
                            }
                        } catch (error) {
                            console.error('Error processing payment:', error);
                            event.complete('fail');
                        }
                    });

                    // Handle payment request errors
                    paymentRequest.on('error', (error) => {
                        console.error('Payment Request Error:', error);
                    });
                }
            }
        };

        if (isOpen && isAgeConfirmed) {
            setupPaymentButton();
        }

        return () => {
            // Cleanup the Stripe button when the modal is closed or the age is unchecked
            if (stripeButton) {
                stripeButton.unmount();
                stripeButton = null;
            }
        };
    }, [paymentRequest, isAgeConfirmed, isOpen]);

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
                <ModalHeader>Unlock Content</ModalHeader>
                <ModalBody 
                    px={{ base: "8px", md: "8px" }} 
                    pt={{ base: 5, md: 5 }} 
                    pb={{ base: 4, md: 5 }}
                >
                    <></>
                    <Text textAlign="center">This is age-restricted content</Text>
                    

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
                        <div id="payment-request-button" style={{ marginTop: '20px' }}></div>
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
