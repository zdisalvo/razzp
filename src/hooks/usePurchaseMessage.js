import { doc, updateDoc, arrayUnion, collection, setDoc, increment, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "../hooks/useShowToast";

const usePurchaseMessage = () => {
    const authUser = useAuthStore((state) => state.user);  // Assuming authUser contains UID and referral info
    const showToast = useShowToast();

    const handlePurchase = async (creatorProfile, price) => {
        if (!authUser || !creatorProfile || !price) return;

        try {

            //POST
            // const postRef = doc(firestore, "posts", post.id);  // Reference to the post document

            // // Add the user's UID to the post.purchased array
            // await updateDoc(postRef, {
            //     purchased: arrayUnion(authUser.uid)
            // });

           

           

            const bonusRef = collection(firestore, "bonus");

            // Calculate 80% of the price for the creator
            const creatorBonus = (0.80 * price).toFixed(2);
    
            // Set the path to a new purchase document within the purchases sub-collection
            const purchaseRef = doc(collection(bonusRef, creatorProfile.uid, "creator"));
            
            // Add a new purchase document
            await setDoc(purchaseRef, {
                purchaseType: "Messages",
                purchasedBy: authUser.uid,
                purchasedByUsername: authUser.username,
                purchaserProfilePicURL: authUser.profilePicURL,
                date: Date.now(),  // Store the date in milliseconds (UNIX timestamp)
                gross: price,
                net: parseFloat(creatorBonus)
            });

            // Increment the creator's total earnings (creatorTotal)
            const creatorTotalRef = doc(firestore, "users", creatorProfile.uid);
            await updateDoc(creatorTotalRef, {
                creatorGross: increment(price), // Increment creatorTotal by the creatorBonus
                creatorNet: increment(parseFloat(creatorBonus)) 
            });

            // Check if the authUser has a referral and calculate 5% of the price for referral
            if (authUser.referral) {
                const referralBonus = (0.1 * price).toFixed(2);

                const referralRef = doc(collection(bonusRef, authUser.referral, "creator"));

                // const referralDocRef = doc(bonusRef, authUser.referral, "referral", authUser.uid);
                // const referralDocSnap = await getDoc(referralDocRef);

                await setDoc(referralRef, {
                    purchaseType: "Referrals",
                    purchasedBy: creatorProfile.uid,
                    purchasedByUsername: creatorProfile.username,
                    purchaserProfilePicURL: creatorProfile.profilePicURL,
                    date: Date.now(),  // Store the date in milliseconds (UNIX timestamp)
                    gross: price,
                    net: parseFloat(referralBonus)
                });
    
                // Increment the creator's total earnings (creatorTotal)
                const creatorTotalRef = doc(firestore, "users", authUser.referral);
                await updateDoc(creatorTotalRef, {
                    creatorGross: increment(price), // Increment creatorTotal by the creatorBonus
                    creatorNet: increment(parseFloat(referralBonus)) 
                });


                // if (referralDocSnap.exists()) {
                //     // Document exists, update it by adding a new purchase
                //     await updateDoc(referralDocRef, {
                //         purchases: arrayUnion({
                //             purchasedBy: authUser.uid,
                //             date: Date.now(),
                //             net: parseFloat(referralBonus)
                //         })
                //     });
                // } else {
                //     // Document doesn't exist, create it with the first purchase
                //     await setDoc(referralDocRef, {
                //         purchases: [{
                //             purchasedBy: authUser.uid,
                //             date: Date.now(),
                //             net: parseFloat(referralBonus)
                //         }]
                //     });
                // }

                // // Increment the referrer's total earnings (referralTotal)
                // const referralTotalRef = doc(firestore, "users", authUser.referral);
                // await updateDoc(referralTotalRef, {
                //     referralTotal: increment(parseFloat(referralBonus))  // Increment referralTotal by the referralBonus
                // });
            }

            showToast("Success", "Message purchased! You can now send your message", "success");
        } catch (error) {
            showToast("Error", "Failed to send message: " + error.message, "error");
        }
    };

    return { handlePurchase };
};

export default usePurchaseMessage;
