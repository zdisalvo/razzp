import { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import useAuthStore from '../store/authStore';

const useBlockUser = () => {
  const authUser = useAuthStore((state) => state.user);
  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState(null);

  const blockUser = async (blockedUserId) => {
    //console.log(authUser);
    if (!authUser) {
      setError('User not authenticated');
      return;
    }

    //console.log(blockedUserId);


    setIsBlocking(true);
    setError(null);

    try {
      const userDocRef = doc(firestore, 'users', authUser.uid);
      const blockedUserDocRef = doc(firestore, 'users', blockedUserId);

      // Update the blocking user's "blocked" list
      await updateDoc(userDocRef, {
        blocked: arrayUnion(blockedUserId),
      });

      // Update the blocked user's "blockedMe" list
      await updateDoc(blockedUserDocRef, {
        blockedMe: arrayUnion(authUser.uid),
      });

      setIsBlocking(false);
    } catch (err) {
      setError(err.message);
      setIsBlocking(false);
    }
  };

  return {
    blockUser,
    isBlocking,
    error,
  };
};

export default useBlockUser;
