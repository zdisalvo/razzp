import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust the import path
import useAuthStore from '../store/authStore'; // Adjust the import path
import useShowToast from './useShowToast'; // Adjust the import path

const useFollowPrivateUser = () => {
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  const followPrivateUser = async (userId) => {
    if (!authUser) {
      showToast("Error", "User not authenticated", "error");
      return;
    }

    try {
      const userDocRef = doc(firestore, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          followers: arrayUnion(userId)
        });

        showToast("Success", "User followed successfully", "success");
      } else {
        showToast("Error", "User document does not exist", "error");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return followPrivateUser;
};

export default useFollowPrivateUser;
