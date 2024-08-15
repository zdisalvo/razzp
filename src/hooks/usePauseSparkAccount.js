import { useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust the path as needed
import useShowToast from './useShowToast'; // Optional, for showing toast notifications

const usePauseSparkAccount = () => {
  const showToast = useShowToast(); // Optional, for showing success/error messages

  const pauseAccount = useCallback(async (userId) => {
    if (!userId) {
      console.error('UserId is required');
      return;
    }

    try {
      // Reference to the specific Spark account document
      const sparkDocRef = doc(firestore, 'spark', userId);

      // Update the `paused` field to `true`
      await updateDoc(sparkDocRef, { paused: true });

      showToast('Your Spark profile has been paused and is not visable'); // Optional toast notification
    } catch (error) {
      console.error('Error updating Spark account:', error);
      showToast('Failed to pause account', 'error'); // Optional toast notification
    }
  }, [showToast]);

  return pauseAccount;
};

export default usePauseSparkAccount;
