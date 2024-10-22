import { doc, updateDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "../hooks/useShowToast";

const usePurchasePost = () => {
    const authUser = useAuthStore((state) => state.user);  // Assuming authUser contains UID and referral info
    const showToast = useShowToast();

    const handlePurchase = async (post, price) => {
        if (!authUser || !post || !price) return;

        try {
            const postRef = doc(firestore, "posts", post.id);  // Reference to the post document

            // Add the user's UID to the post.purchased array
            await updateDoc(postRef, {
                purchased: arrayUnion(authUser.uid)
            });

            const bonusRef = collection(firestore, "bonus");

            // Calculate 80% of the price for the creator
            const creatorBonus = (0.80 * price).toFixed(2);

            // Add the creator bonus to Firestore (auto-generate document ID)
            await addDoc(collection(bonusRef, post.createdBy, "creator"), {
                purchasedBy: authUser.uid,
                date: new Date(),
                price: parseFloat(creatorBonus)
            });

            // Check if the authUser has a referral and calculate 5% of the price for referral
            if (authUser.referral) {
                const referralBonus = (0.05 * price).toFixed(2);

                // Add the referral bonus to Firestore (auto-generate document ID)
                await addDoc(collection(bonusRef, authUser.referral, "referral"), {
                    purchasedBy: authUser.uid,
                    date: new Date(),
                    price: parseFloat(referralBonus)
                });
            }

            showToast("Success", "Post purchased successfully!", "success");
        } catch (error) {
            showToast("Error", "Failed to purchase post: " + error.message, "error");
        }
    };

    return { handlePurchase };
};

export default usePurchasePost;
