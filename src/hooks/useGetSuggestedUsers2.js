import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { collection, getDocs, getDoc, doc, limit, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSuggestedUsers2 = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  useEffect(() => {
    const getSuggestedUsers = async () => {
      setIsLoading(true);
      try {
        const usersRef = collection(firestore, "users");

        // Get the list of user's followers
        const userDoc = await getDoc(doc(firestore, "users", authUser.uid));
        const userData = userDoc.data();
        const userFollowers = userData.followers || [];

        // Get users who are following the user's followers
        const followersFollowingQueries = userFollowers.map(follower =>
          query(
            usersRef,
            where("following", "array-contains", follower),
            where("uid", "not-in", [authUser.uid, ...authUser.following]),
            limit(10)
          )
        );

        const followersFollowingSnapshots = await Promise.all(
          followersFollowingQueries.map(q => getDocs(q))
        );

        const followersFollowingUsers = [];
        followersFollowingSnapshots.forEach(snapshot => {
          snapshot.forEach(doc => {
            if (!followersFollowingUsers.some(user => user.uid === doc.data().uid)) {
              followersFollowingUsers.push({ ...doc.data(), id: doc.id });
            }
          });
        });

        // Get users who are followed by the same users that the auth user follows
        const followingUsersQueries = authUser.following.map(following =>
          query(
            usersRef,
            where("followers", "array-contains", following),
            where("uid", "not-in", [authUser.uid, ...authUser.following]),
            limit(10)
          )
        );

        const followingUsersSnapshots = await Promise.all(
          followingUsersQueries.map(q => getDocs(q))
        );

        const followingUsers = [];
        followingUsersSnapshots.forEach(snapshot => {
          snapshot.forEach(doc => {
            if (!followingUsers.some(user => user.uid === doc.data().uid)) {
              followingUsers.push({ ...doc.data(), id: doc.id });
            }
          });
        });

        // Combine and deduplicate the suggested users
        const combinedUsers = [...followersFollowingUsers, ...followingUsers];
        const uniqueSuggestedUsers = combinedUsers.filter(
          (user, index, self) => index === self.findIndex(u => u.uid === user.uid)
        );

        // Limit the suggestions to a certain number
        const limitedSuggestedUsers = uniqueSuggestedUsers.slice(0, 20);

        setSuggestedUsers(limitedSuggestedUsers);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) getSuggestedUsers();
  }, [authUser, showToast]);

  return { isLoading, suggestedUsers };
};

export default useGetSuggestedUsers2;
