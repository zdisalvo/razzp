import { useState } from 'react';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust the import path
import useAuthStore from '../store/authStore'; // Adjust the import path
import useShowToast from '../hooks/useShowToast'; // Adjust the import path if needed

const useUnrequestFollow = () => {
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  const unrequestFollow = async (userId) => {
    if (!authUser) {
      showToast('Error', 'User not authenticated', 'error');
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        requested: arrayRemove(authUser.uid),
      });
      //showToast('Success', 'Follow request removed successfully', 'success');
    } catch (error) {
      console.error('Error removing follow request:', error);
      showToast('Error', error.message, 'error');
    }
  };

  return unrequestFollow;
};

export default useUnrequestFollow;
