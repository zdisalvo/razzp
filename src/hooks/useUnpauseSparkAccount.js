import { useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust the path as needed
import useShowToast from './useShowToast'; // Optional, for showing toast notifications

const useUnpauseSparkAccount = () => {
  const showToast = useShowToast(); // Optional, for showing success/error messages

  const unpauseAccount = useCallback(async (userId) => {
    if (!userId) {
      console.error('UserId is required');
      return;
    }

    try {
      // Reference to the specific Spark account document
      const sparkDocRef = doc(firestore, 'spark', userId);

      // Update the `paused` field to `false`
      await updateDoc(sparkDocRef, { paused: false });

      showToast('Your Spark profile is now active and visible'); // Optional toast notification
    } catch (error) {
      console.error('Error updating Spark account:', error);
      showToast('Failed to unpause account', 'error'); // Optional toast notification
    }
  }, [showToast]);

  return unpauseAccount;
};

export default useUnpauseSparkAccount;
