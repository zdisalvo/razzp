import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../firebase/firebase"; // Adjust the import path as necessary
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast"; // Assuming you have a custom hook for showing toast notifications

const useSetPublicProfile = () => {
  const { authUser } = useAuthStore((state) => ({
    authUser: state.user,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const showToast = useShowToast();

  const setPublic = async () => {
    if (!authUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userDocRef = doc(firestore, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { requested = [] } = userData;

        // Add requested users to followers and remove followPrivate notifications
        const updatedNotifications = [...userData.notifications || []].filter(
          (notif) => !requested.some(userId => notif.userId === userId && notif.type === "followPrivate")
        );

        for (const userId of requested) {
          const requestedProfileDoc = await getDoc(doc(firestore, "users", userId));
          const requestedProfile = requestedProfileDoc.data();

          if (requestedProfile) {
            const notification = {
              userId: requestedProfile.uid,
              username: requestedProfile.username,
              profilePic: requestedProfile.profilePicURL,
              time: new Date().getTime(),
              type: "follow",
            };
            updatedNotifications.push(notification);
          }
        }

        await updateDoc(userDocRef, {
          private: false,
          followers: arrayUnion(...requested),
          requested: [], // Clear the requested array
          notifications: updatedNotifications,
        });

        showToast("Success", "Profile set to public", "success");
      } else {
        throw new Error("User profile does not exist");
      }
    } catch (error) {
      console.error("Error setting profile to public: ", error);
      setError(error);
      showToast("Error", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return { setPublic, isLoading, error };
};

export default useSetPublicProfile;
