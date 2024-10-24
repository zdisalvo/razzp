import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import usePurchasePost from "../../hooks/usePurchasePost";

const stripePromise = loadStripe('pk_test_51QDDRNF8INFI9spHDcvYT97lRNENvUzlVE7IycQPD53LOr9vmGLXpjfx1aLnW48niZ4EJg0dcZTtYFqm2Ssnwxhi00wHKGaHTv'); // Replace with your Stripe publishable key

const CheckoutButton = ({ post }) => {
    const [paymentRequest, setPaymentRequest] = useState(null);
    const { handlePurchase } = usePurchasePost();

    const handlePurchaseClick = () => {
        handlePurchase(post, post.price);  // Pass the post and price to the purchase handler
    };

    useEffect(() => {
        const initPaymentRequest = async () => {
            const stripe = await stripePromise;

            // Create a Payment Request
            const request = stripe.paymentRequest({
                country: 'US', // Use your country code
                currency: 'usd',
                total: {
                    label: 'One-Time Payment',
                    amount: post.price * 100, // Amount in cents ($10.00)
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            // Check if the Payment Request API is available
            request.canMakePayment().then((result) => {
                if (result) {
                    setPaymentRequest(request);
                } else {
                    console.log('Payment Request API not available.');
                }
            });
        };

        initPaymentRequest();
    }, []);

    useEffect(() => {
        const setupPaymentButton = async () => {
            if (paymentRequest) {
                // Create a payment request button
                const prButton = document.getElementById('payment-request-button');
                const stripe = await stripePromise;

                const elements = stripe.elements();
                const button = elements.create('paymentRequestButton', {
                    paymentRequest: paymentRequest,
                });

                button.mount(prButton);

                // Handle the token received from the payment request
                paymentRequest.on('token', async (event) => {
                    try {
                        // Send the token to your backend for processing
                        const response = await fetch('/your-backend-endpoint', { // Replace with your backend endpoint
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ token: event.token.id }),
                        });

                        if (response.ok) {
                            // Payment processed successfully
                            event.complete('success');
                            handlePurchaseClick();
                            console.log('Payment succeeded!');
                        } else {
                            // Handle errors from your server
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
        };

        setupPaymentButton(); // Call the function to set up the payment button
    }, [paymentRequest]);

    return (
        <div>
            <h1>My Product</h1>
            <p>Product description goes here.</p>
            <p>Price: $10.00</p>
            <div id="payment-request-button"></div>
        </div>
    );
};


export default CheckoutButton;
