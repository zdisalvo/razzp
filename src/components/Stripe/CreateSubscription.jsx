import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import useAuthStore from "../../store/authStore"; // Assuming a hook to get the logged-in user

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CreateSubscription = ({creator}) => {
  const [creatorId, setCreatorId] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const authUser = useAuthStore((state) => state.user); // Get the logged-in user

  const handleSubscription = async (e) => {
    e.preventDefault();
    setLoading(true);

    setCreatorName(creator.username);
    setCreatorId(creator.uid);

    try {
      const stripe = await stripePromise;

      const response = await fetch("https://razzp-subscribe-56142959b61f.herokuapp.com/create-creator-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId,
          creatorName,
          subscriptionPrice: Number(subscriptionPrice),
          userId: creator.uid, // Pass the user's UID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Redirect to Stripe Checkout
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Create Subscription</h2>
      <form onSubmit={handleSubscription}>
        <label>
          Creator ID:
          <input
            type="text"
            value={creator.uid}
            //onChange={(e) => setCreatorId(e.target.value)}
            required
            readOnly
          />
        </label>
        <br />
        <label>
          Creator Name:
          <input
            type="text"
            value={creator.username}
            //onChange={(e) => setCreatorName(e.target.value)}
            required
            readOnly
          />
        </label>
        <br />
        <label>
          Subscription Price (in USD):
          <input
            type="number"
            value={subscriptionPrice}
            onChange={(e) => setSubscriptionPrice(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default CreateSubscription;
