import { useState } from 'react';
import { doc, updateDoc, arrayUnion, increment, getDoc} from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust to your Firebase configuration
import useAuthStore from '../store/authStore';

const usePayoutCreator = () => {
    const authUser = useAuthStore((state) => state.user); // Assumes you have an auth store that provides uid
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!authUser) {
    return {
      createPayout: () => {
        console.error("No authenticated user found.");
      },
      loading: false,
      error: "User not authenticated",
    };
  }

  const createPayout = async (amount) => {
    if (!authUser.uid || !amount) {
      setError('Invalid user ID or amount');
      return;
    }

    setLoading(true);
    setError(null);

    const payoutId = `${authUser.uid}-${Date.now()}`;
    const payoutData = {
      payoutId,
      time: Date.now(),
      amount
    };

    try {
        const userDocRef = doc(firestore, 'users', authUser.uid);
    
        // Retrieve the current user document
        const userDoc = await getDoc(userDocRef);
    
        if (userDoc.exists()) {
          const userData = userDoc.data();
    
          // If creatorPayments already exists, increment it; otherwise, initialize it to the payout amount
          await updateDoc(userDocRef, {
            payouts: arrayUnion(payoutData),
            creatorPayments: userData.creatorPayments ? increment(amount) : amount,
          });
    
          console.log('Payout successfully created and recorded.');
        } else {
          // Handle the case where the user document does not exist (if necessary)
          console.log('User document does not exist.');
          setError('User document not found');
        }
      } catch (err) {
        setError('Failed to create payout: ' + (err.message || err));
      } finally {
        setLoading(false);
      }
    };

  return {
    createPayout,
    loading,
    error
  };
};

export default usePayoutCreator;
