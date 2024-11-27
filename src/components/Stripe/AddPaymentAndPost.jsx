import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@chakra-ui/react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { firestore } from "../../firebase/firebase";
import { doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";
import usePurchasePost from "../../hooks/usePurchasePost";

// Load the Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const AddPaymentAndPost = ({ creatorProfile, authUser, post, onClose}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  //const [postPrice, setSubscriptionPrice] = useState("");
  const { handlePurchase } = usePurchasePost();
  

  const userId = authUser.uid;
  const creatorId = creatorProfile.uid;

  

  // Fetch subscription price
  // useEffect(() => {
  //   const fetchSubscriptionPrice = async () => {
  //     if (subscriptionPrice || !userProfile) return;

  //     try {
  //       const subscriptionDocRef = doc(firestore, "subscriptions", userProfile.uid);
  //       const subscriptionDocSnap = await getDoc(subscriptionDocRef);

  //       if (subscriptionDocSnap.exists()) {
  //         const subscriptionData = subscriptionDocSnap.data();
  //         const priceId = Object.values(subscriptionData)?.[0]?.priceId;
  //         setSubscriptionPrice(priceId);
  //       } else {
  //         console.log("No subscription found with the given priceId.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching subscription price:", error);
  //     }
  //   };

  //   fetchSubscriptionPrice();
  // }, [userProfile, subscriptionPrice]);

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
      // if (!useCurrentPayment && !paymentMethodId ) {
      //   const { paymentMethod, error } = await stripe.createPaymentMethod({
      //     type: "card",
      //     card: elements.getElement(PaymentElement),
      //   });

      //   if (error) {
      //     setErrorMessage(error.message);
      //     setLoading(false);
      //     return;
      //   }

      //   paymentMethodId = paymentMethod.id;
      // }

      // // Confirm card setup if using a new payment method
      // if (!useCurrentPayment && clientSecret) {
      //   const { error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
      //     payment_method: paymentMethodId,
      //   });

      //   if (confirmError) {
      //     setErrorMessage(confirmError.message);
      //     setLoading(false);
      //     return;
      //   }
      // }

      // Subscribe user https://razzp-subscribe-56142959b61f.herokuapp.com/subscribe-user
      const response = await axios.post(
        "https://razzp-subscribe-56142959b61f.herokuapp.com/one-time-purchase",
        {
          userId,
          price: post.price,
          paymentMethodId,
        }
      );


      if (response.data.transactionStatus) {
        
        if (response.data.transactionStatus === "succeeded") {
            //addSubscriptionToFirestore();
            handlePurchase(post, post.price, creatorProfile);
            onClose();
        } else {
        alert("Payment " + response.data.transactionStatus);
        }
      } else {
        alert("Payment failed.");
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
            ? "Processing payment..."
            : `Purchase Post with ${paymentMethods[0].card.brand} ending in ${paymentMethods[0].card.last4}`}
            </Button>
            <Button size="sm" mt={3} type="button" onClick={() => setShowAddPaymentForm(true)}>
              Add New Payment Method
            </Button>
          </div>
        ) : null}

        {showAddPaymentForm || paymentMethods.length === 0 ? (
          <PaymentForm
              userId={userId}
              post={post}
              creatorProfile={creatorProfile}
              setLoading={setLoading}
              onClose={onClose}
          />
        ) : null}
      </div>
    </Elements>
  );
};

const PaymentForm = ({ userId, post, creatorProfile, loading, setLoading, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const { handlePurchase } = usePurchasePost();


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
        const response = await axios.post(
          "https://razzp-subscribe-56142959b61f.herokuapp.com/one-time-purchase",
          {
            userId,
            price: post.price,
            paymentMethodId: setupIntent.payment_method
          }
        );
  
  
        if (response.data.transactionStatus) {
          
          if (response.data.transactionStatus === "succeeded") {
              //addSubscriptionToFirestore();
              handlePurchase(post, post.price, creatorProfile);
              onClose();
          } else {
          alert("Payment " + response.data.transactionStatus);
          }
        } else {
          alert("Payment failed.");
        }
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
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Purchase"}
      </Button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </form>
  );
};

export default AddPaymentAndPost;
