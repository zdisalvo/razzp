import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase"; // Adjust the import path as necessary
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast"; // Assuming you have a custom hook for showing toast notifications
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const useSetContentCreator = () => {
  const { authUser } = useAuthStore((state) => ({
    authUser: state.user,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const showToast = useShowToast();

  const setCreator = async () => {
    if (!authUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userDocRef = doc(firestore, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, { 
            creator: true,
            creatorSubscriptionPrice: 9,
            creatorMessagePrice: 5,
        });

        const stripe = await stripePromise;

      const response = await fetch("https://razzp-subscribe-56142959b61f.herokuapp.com/create-creator-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: authUser.uid,
          creatorName: authUser.username,
          subscriptionPrice: Number(9),
          userId: authUser.uid, // Pass the user's UID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

        showToast("Success", "Paid content creation now active", "success");
      } else {
        throw new Error("User profile does not exist");
      }
    } catch (error) {
      console.error("Error setting content creator to active: ", error);
      setError(error);
      showToast("Error", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return { setCreator, isLoading, error };
};

export default useSetContentCreator;
