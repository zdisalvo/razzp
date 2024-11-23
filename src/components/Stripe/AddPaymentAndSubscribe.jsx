import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@chakra-ui/react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { firestore } from "../../firebase/firebase";
import { doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";

// Load the Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const AddPaymentAndSubscribe = ({ userProfile, authUser, onClose}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [subscriptionPrice, setSubscriptionPrice] = useState("");

  const userId = authUser.uid;
  const creatorId = userProfile.uid;

  const addSubscriptionToFirestore = async () => {
    try {
      // Calculate expiration date (one month out, same calendar day)
      const createdAt = new Date();
      const expirationDate = dayjs(createdAt).add(1, "month").toDate();
  
      // Subscription details
      const subscriptionData = {
        creatorId,
        createdAt,
        expirationDate,
      };
  
      // Reference to the user document
      const userDocRef = doc(firestore, "users", userId);
  
      // Update Firestore document
      await updateDoc(userDocRef, {
        subscriptions: arrayUnion(subscriptionData),
      });
  
      console.log("Subscription successfully added to Firestore");
    } catch (error) {
      console.error("Error adding subscription to Firestore:", error);
    }
  };

  // Fetch subscription price
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

  // Generate SetupIntent clientSecret
  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await axios.post(
          "https://razzp-subscribe-56142959b61f.herokuapp.com/create-setup-intent",
          { userId }
        );
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Failed to create SetupIntent:", error.message);
      }
    };

    createSetupIntent();
  }, [userId]);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.post(
          "https://razzp-subscribe-56142959b61f.herokuapp.com/get-payment-methods",
          { userId }
        );
        if (response.data.paymentMethods.length > 0) {
          setPaymentMethods(response.data.paymentMethods);
          setSelectedPaymentMethod(response.data.paymentMethods[0].id);
        }
      } catch (error) {
        setErrorMessage(error.message || "Failed to fetch payment methods.");
      }
    };

    fetchPaymentMethods();
  }, [userId]);

  // Handle form submission for new or existing payment methods
  const handleSubmit = async (e, useCurrentPayment = false) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (!stripe) return;

      let paymentMethodId = selectedPaymentMethod;

      // Create a new payment method if not using the current one
      if (!useCurrentPayment && !paymentMethodId) {
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(PaymentElement),
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        paymentMethodId = paymentMethod.id;
      }

      // Confirm card setup if using a new payment method
      if (!useCurrentPayment && clientSecret) {
        const { error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
          payment_method: paymentMethodId,
        });

        if (confirmError) {
          setErrorMessage(confirmError.message);
          setLoading(false);
          return;
        }
      }

      // Subscribe user
      const response = await axios.post(
        "https://razzp-subscribe-56142959b61f.herokuapp.com/subscribe-user",
        {
          userId,
          priceId: subscriptionPrice,
          paymentMethodId,
        }
      );

      if (response.data.transactionStatus) {
        if (response.data.transactionStatus === "succeeded") {
            addSubscriptionToFirestore();
            
            onClose();
        } else {
        alert("Payment " + response.data.transactionStatus);
        }
      } else {
        alert("Subscription failed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div>
        {paymentMethods.length > 0  ? (
          <div>
            {/* <h3>Current Payment Method</h3>
            <p>
              {paymentMethods[0].card.brand} ending in {paymentMethods[0].card.last4}
            </p> */}
            <Button
              size="sm"
              mt={3}
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              {loading
            ? "Processing..."
            : `Subscribe with ${paymentMethods[0].card.brand} ending in ${paymentMethods[0].card.last4}`}
            </Button>
            <Button size="sm" mt={3} type="button" onClick={() => setShowAddPaymentForm(true)}>
              Add New Payment
            </Button>
          </div>
        ) : null}

        {showAddPaymentForm || paymentMethods.length === 0 ? (
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <h3>{paymentMethods.length === 0 ? "Add a Payment Method" : "Enter Payment Method"}</h3>
            <div>
              <PaymentElement />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Subscribe"}
            </Button>
            {errorMessage && <div>{errorMessage}</div>}
          </form>
        ) : null}
      </div>
    </Elements>
  );
};

export default AddPaymentAndSubscribe;
