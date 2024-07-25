import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';

const useCheckBlockedUser = ( {userProfile} ) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const authUser = useAuthStore((state) => state.user);

  //console.log(userProfile);

  useEffect(() => {
    if (!authUser || !userProfile) {
      setIsBlocked(false);
      return;
    }

    const checkBlocked = () => {
      if (userProfile.blocked && userProfile.blocked.includes(authUser.uid)) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    };

    checkBlocked();
  }, [authUser, userProfile]);

  return isBlocked;
};

export default useCheckBlockedUser;
