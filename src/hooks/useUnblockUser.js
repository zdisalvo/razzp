import { useState } from 'react';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import useAuthStore from '../store/authStore';

const useUnblockUser = () => {
  const authUser = useAuthStore((state) => state.user); // Access the current authenticated user
  const [isUnblocking, setIsUnblocking] = useState(false); // State to track the unblocking process
  const [error, setError] = useState(null); // State to track errors

  const unblockUser = async (blockedUserId) => {
    if (!authUser) {
      setError('User not authenticated');
      return;
    }

    setIsUnblocking(true);
    setError(null);

    try {
      const userDocRef = doc(firestore, 'users', authUser.uid);
      const blockedUserDocRef = doc(firestore, 'users', blockedUserId);

      // Update the blocking user's "blocked" list
      await updateDoc(userDocRef, {
        blocked: arrayRemove(blockedUserId),
      });

      // Update the blocked user's "blockedMe" list
      await updateDoc(blockedUserDocRef, {
        blockedMe: arrayRemove(authUser.uid),
      });

      setIsUnblocking(false);
    } catch (err) {
      setError(err.message);
      setIsUnblocking(false);
    }
  };

  return {
    unblockUser,
    isUnblocking,
    error,
  };
};

export default useUnblockUser;
