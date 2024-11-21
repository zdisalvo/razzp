import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { firestore } from "../../firebase/firebase";
import { addDoc, arrayUnion, collection, doc, updateDoc, getDoc } from "firebase/firestore";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// userId, creatorId, subscriptionPrice
const AddPaymentAndSubscribe = ({ userProfile, authUser }) => {
  if (!userProfile || !authUser) return null;

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = authUser.uid;
  const creatorId = userProfile.uid;
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  useEffect(() => {
    const fetchSubscriptionPrice = async () => {
      if (subscriptionPrice || !userProfile) return;

      try {
        const subscriptionDocRef = doc(firestore, "subscriptions", userProfile.uid);
        const subscriptionDocSnap = await getDoc(subscriptionDocRef);

        if (subscriptionDocSnap.exists()) {
          const subscriptionData = subscriptionDocSnap.data();
          const priceId = Object.values(subscriptionData)?.[0]?.priceId;
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

  // Fetch the client secret from the backend based on the selected payment method or without any payment method
  const fetchClientSecret = async () => {
    try {
      let response;
      if (selectedPaymentMethod) {
        // If a payment method is selected, fetch the client secret using that payment method
        response = await axios.post("https://razzp-subscribe-56142959b61f.herokuapp.com/create-setup-intent", {
          userId,
          priceId: subscriptionPrice,
          paymentMethodId: selectedPaymentMethod, // Use selected payment method for client secret
        });
      } else {
        // If no payment method is selected, fetch the client secret without it
        response = await axios.post("https://razzp-subscribe-56142959b61f.herokuapp.com/create-setup-intent", {
          userId,
          priceId: subscriptionPrice, // Only pass the subscription price when no payment method is selected
        });
      }
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      console.error("Error fetching client secret:", error);
    }
  };

  // Fetch saved payment methods for the user
  const fetchSavedPaymentMethods = async () => {
    try {
      const response = await axios.post("https://razzp-subscribe-56142959b61f.herokuapp.com/get-payment-methods", { userId });

      // Log the response to see the structure of the data
      console.log("Fetched payment methods:", response.data);

      const methods = response.data.paymentMethods || [];
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  // Trigger fetchClientSecret when the payment method changes or when no method is selected
  useEffect(() => {
    fetchClientSecret();
  }, [selectedPaymentMethod, userId, subscriptionPrice]);

  // Fetch payment methods once the component mounts
  useEffect(() => {
    fetchSavedPaymentMethods();
  }, [userId]);

  return (
    <div>
      <h2>Add Payment Method and Subscribe</h2>

      {/* If client secret is available, render the payment form */}
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            userId={userId}
            creatorId={creatorId}
            subscriptionPrice={subscriptionPrice}
            setLoading={setLoading}
            paymentMethods={paymentMethods}
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
          />
        </Elements>
      ) : (
        <p>Loading payment form...</p>
      )}
    </div>
  );
};

// Form to handle payment and subscription
const PaymentForm = ({
  userId,
  creatorId,
  subscriptionPrice,
  loading,
  setLoading,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If no payment method is selected, show an alert
      if (!selectedPaymentMethod && !elements) {
        alert("Please select a payment method or enter your card details.");
        setLoading(false);
        return;
      }

      if (!stripe || !elements) {
        // Make sure stripe and elements are initialized
        return;
      }

      // Confirm the setup of the payment method
      const { setupIntent, error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin, // Optional, redirects after setup
        },
        paymentMethod: selectedPaymentMethod || undefined, // Use the selected payment method or new one if not selected
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
      {/* Display saved payment methods in a dropdown */}
      <div>
        <label>Select a payment method</label>
        <select
          value={selectedPaymentMethod || ""}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        >
          <option value="">Select a payment method</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.card.brand} ending in {method.card.last4}
            </option>
          ))}
        </select>
      </div>

      {/* Render the PaymentElement for entering new payment details if no method is selected */}
      {!selectedPaymentMethod && <PaymentElement />}

      <button type="submit" disabled={!stripe || loading || (!selectedPaymentMethod && !elements)}>
        {loading ? "Processing..." : "Submit Payment"}
      </button>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </form>
  );
};

export default AddPaymentAndSubscribe;
