import { doc, updateDoc, arrayUnion, collection, setDoc, increment, getDoc } from "firebase/firestore";
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

            // Set or update the creator bonus, using the purchaser's UID as the document ID
            const creatorDocRef = doc(bonusRef, post.createdBy, "creator", authUser.uid);
            const creatorDocSnap = await getDoc(creatorDocRef);
            
            if (creatorDocSnap.exists()) {
                // Document exists, update it by adding a new purchase
                await updateDoc(creatorDocRef, {
                    purchases: arrayUnion({
                        purchasedBy: authUser.uid,
                        date: Date.now(),  // Store the date in milliseconds (UNIX timestamp)
                        gross: price,
                        net: parseFloat(creatorBonus)
                    })
                });
            } else {
                // Document doesn't exist, create it with the first purchase
                await setDoc(creatorDocRef, {
                    purchases: [{
                        purchasedBy: authUser.uid,
                        date: Date.now(),
                        gross: price,
                        net: parseFloat(creatorBonus)
                    }]
                });
            }

            // Increment the creator's total earnings (creatorTotal)
            const creatorTotalRef = doc(firestore, "users", post.createdBy);
            await updateDoc(creatorTotalRef, {
                creatorGross: increment(price), // Increment creatorTotal by the creatorBonus
                creatorNet: increment(parseFloat(creatorBonus)) 
            });

            // Check if the authUser has a referral and calculate 5% of the price for referral
            if (authUser.referral) {
                const referralBonus = (0.05 * price).toFixed(2);

                const referralDocRef = doc(bonusRef, authUser.referral, "referral", authUser.uid);
                const referralDocSnap = await getDoc(referralDocRef);

                if (referralDocSnap.exists()) {
                    // Document exists, update it by adding a new purchase
                    await updateDoc(referralDocRef, {
                        purchases: arrayUnion({
                            purchasedBy: authUser.uid,
                            date: Date.now(),
                            net: parseFloat(referralBonus)
                        })
                    });
                } else {
                    // Document doesn't exist, create it with the first purchase
                    await setDoc(referralDocRef, {
                        purchases: [{
                            purchasedBy: authUser.uid,
                            date: Date.now(),
                            net: parseFloat(referralBonus)
                        }]
                    });
                }

                // Increment the referrer's total earnings (referralTotal)
                const referralTotalRef = doc(firestore, "users", authUser.referral);
                await updateDoc(referralTotalRef, {
                    referralTotal: increment(parseFloat(referralBonus))  // Increment referralTotal by the referralBonus
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
