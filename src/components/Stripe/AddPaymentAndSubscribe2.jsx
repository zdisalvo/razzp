import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { firestore } from "../../firebase/firebase";
import { addDoc, arrayUnion, collection, doc, updateDoc, getDoc} from "firebase/firestore";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
//userId, creatorId, subscriptionPrice
const AddPaymentAndSubscribe = ({ userProfile, authUser }) => {

    if (!userProfile || !authUser)
        return;

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = authUser.uid;
  const creatorId = userProfile.uid;
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  
  console.log(userProfile);
  
  useEffect(() => {
    const fetchSubscriptionPrice = async () => {
      if (subscriptionPrice || !userProfile) return; // Prevent unnecessary fetches if already set

      try {
        const subscriptionDocRef = doc(firestore, "subscriptions", userProfile.uid);
        const subscriptionDocSnap = await getDoc(subscriptionDocRef);

        if (subscriptionDocSnap.exists()) {
          const subscriptionData = subscriptionDocSnap.data();
          const priceId = Object.values(subscriptionData)?.[0]?.priceId;
          console.log("Subscription Data:", subscriptionData);
          setSubscriptionPrice(priceId);
        } else {
          console.log("No subscription found with the given priceId.");
        }
      } catch (error) {
        console.error("Error fetching subscription price:", error);
      }
    };

    fetchSubscriptionPrice();
  }, [userProfile, subscriptionPrice]); 


  // Fetch the client secret from the backend
  const fetchClientSecret = async () => {
    try {
      const response = await axios.post("https://razzp-subscribe-56142959b61f.herokuapp.com/create-setup-intent", { userId });
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      console.error("Error fetching client secret:", error);
    }
  };

  // Run this when the component mounts
  React.useEffect(() => {
    fetchClientSecret();
  }, []);

  return (
    <div>
      <h2>Add Payment Method and Subscribe</h2>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            userId={userId}
            creatorId={creatorId}
            subscriptionPrice={subscriptionPrice}
            setLoading={setLoading}
          />
        </Elements>
      ) : (
        <p>Loading payment form...</p>
      )}
    </div>
  );
};

// Form to handle payment and subscription
const PaymentForm = ({ userId, creatorId, subscriptionPrice, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Confirm the setup of the payment method
      const { setupIntent, error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin, // Optional, redirects after setup
        },
        redirect: "if_required", // Avoid redirection when unnecessary
      });
  
      if (error) {
        setErrorMessage(error.message);
      } else {
        // Save the payment method and subscribe the user
        await axios.post("https://razzp-subscribe-56142959b61f.herokuapp.com/subscribe-user", {
          userId,
          priceId: subscriptionPrice,
          paymentMethodId: setupIntent.payment_method,
        });
        alert("Subscription successful!");
      }
    } catch (err) {
      setErrorMessage(err.message || "An error occurred while processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Submit Payment"}
      </button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </form>
  );
};

export default AddPaymentAndSubscribe;
