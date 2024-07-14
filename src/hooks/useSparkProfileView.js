import { useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import useAuthStore from "../store/authStore";
import { firestore } from "../firebase/firebase";

const useSparkProfileView = (sparkProfile) => {
    const authUser = useAuthStore((state) => state.user);

  const updateProfileView = useCallback(async (profileId) => {
    const sparkUserRef = doc(firestore, 'spark', authUser.uid);

    try {
      if (
        !sparkProfile.viewed1x.includes(profileId) &&
        !sparkProfile.viewed2x.includes(profileId) &&
        !sparkProfile.viewed3x.includes(profileId)
      ) {
        await updateDoc(sparkUserRef, {
          viewed1x: arrayUnion(profileId),
        });
      } else if (sparkProfile.viewed1x.includes(profileId)) {
        await updateDoc(sparkUserRef, {
          viewed1x: arrayRemove(profileId),
          viewed2x: arrayUnion(profileId),
        });
      } else if (sparkProfile.viewed2x.includes(profileId)) {
        await updateDoc(sparkUserRef, {
          viewed2x: arrayRemove(profileId),
          viewed3x: arrayUnion(profileId),
        });
      } else if (sparkProfile.viewed3x.includes(profileId)) {
        await updateDoc(sparkUserRef, {
          viewed3x: arrayRemove(profileId),
        });
      }
    } catch (error) {
      console.error('Error updating profile view:', error);
    }
  }, [authUser.uid, sparkProfile]);

  return updateProfileView;
};

export default useSparkProfileView;
