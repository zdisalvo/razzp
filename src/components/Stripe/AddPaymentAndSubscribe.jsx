import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@chakra-ui/react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { firestore } from "../../firebase/firebase";
import { doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";
import GoldButton from "../GoldButton/GoldButton";

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
        console.log("SetupIntent clientSecret:", response.data.clientSecret);
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Failed to create SetupIntent:", error.message);
      }
    };

    createSetupIntent();
  }, [userId]);

  //console.log(clientSecret);

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


//   useEffect(() => {
//     console.log(elements);
//     console.log("Checking PaymentElement initialization:", elements?.getElement(PaymentElement));
//   }, [elements]);

  // Handle form submission for new or existing payment methods
  const handleSubmit = async (e, useCurrentPayment = false) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (!stripe) return;

      let paymentMethodId = selectedPaymentMethod;


      // Subscribe user https://razzp-subscribe-56142959b61f.herokuapp.com/subscribe-user
      const response = await axios.post(
        "https://razzp-subscribe-56142959b61f.herokuapp.com/subscribe-user",
        {
          userId,
          creatorId,
          priceId: subscriptionPrice,
          paymentMethodId,
        }
      );

      if (response.data.transactionStatus) {
        if (response.data.transactionStatus === "succeeded") {
            //addSubscriptionToFirestore();
            
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
            
            <GoldButton
              size="sm"
              mt={3}
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              {loading 
            ? "Processing payment..."
            : `Subscribe with ${paymentMethods[0].card.brand} ...${paymentMethods[0].card.last4}`}
            </GoldButton>
            <GoldButton size="sm" mt={3} type="button" onClick={() => setShowAddPaymentForm(true)}>
              Add New Payment Method
            </GoldButton>
          </div>
        ) : null }

        {showAddPaymentForm || paymentMethods.length === 0 ? (
          
            <PaymentForm
                userId={userId}
                creatorId={creatorId}
                subscriptionPrice={subscriptionPrice}
                setLoading={setLoading}
                onClose={onClose}
            />
            
        ) : null}
      </div>
    </Elements>
  );
};

const PaymentForm = ({ userId, creatorId, subscriptionPrice, loading, setLoading, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState("");
  
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      //console.log(elements);
    
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
            "https://razzp-subscribe-56142959b61f.herokuapp.com/subscribe-user",
            {
              userId,
              creatorId,
              priceId: subscriptionPrice,
              paymentMethodId: setupIntent.payment_method,
            }
          );
          if (response.data.transactionStatus) {
            if (response.data.transactionStatus === "succeeded") {
                //addSubscriptionToFirestore();
                
                onClose();
            } else {
            alert("Payment " + response.data.transactionStatus);
            }
          } else {
            alert("Subscription failed.");
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
        <GoldButton type="submit" disabled={!stripe || loading}>
          {loading ? "Processing..." : "Subscribe"}
        </GoldButton>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </form>
    );
  };

export default AddPaymentAndSubscribe;
