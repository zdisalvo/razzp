import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust the import path
import useAuthStore from '../store/authStore'; // Adjust the import path
import useShowToast from './useShowToast'; // Adjust the import path
//import useGetUserProfileById from './useGetUserProfileById';

const useFollowPrivateUser = () => {
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  const followPrivateUser = async (userId, username, profilePicURL) => {
    if (!authUser) {
      showToast("Error", "User not authenticated", "error");
      return;
    }

    try {
        const userDocRef = doc(firestore, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);

        const followerDocRef = doc(firestore, "users", userId);
        const followerDoc = await getDoc(followerDocRef);
    
        const notification = {
          userId: userId,
          username: username,
          profilePic: profilePicURL,
          time: new Date().getTime(),
          type: "follow",
        };

        //console.log(notification);
    
        if (userDoc.exists()) {
          const notifications = userDoc.data().notifications || []; // Default to an empty array if not defined
    
          // Filter out the followPrivate notification
          const updatedNotifications = notifications.filter(
            (notif) => !(notif.userId === userId && notif.type === "followPrivate")
          );
          updatedNotifications.push(notification);
    
          // Use updateDoc to update only the necessary fields
          await updateDoc(userDocRef, {
            followers: arrayUnion(userId),
            requested: arrayRemove(userId),
            notifications: updatedNotifications,
          });

          await updateDoc(followerDocRef, {
            following: arrayUnion(authUser.uid),
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
