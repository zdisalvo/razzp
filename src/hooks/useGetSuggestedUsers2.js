import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { collection, getDocs, getDoc, doc, query, where, limit } from "firebase/firestore";
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

        // Helper function to split an array into smaller chunks
        const chunkArray = (array, chunkSize) => {
          const result = [];
          for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
          }
          return result;
        };

        // Fetch users based on a field and list of UIDs
        const fetchUsers = async (field, userList, limitCount) => {
          const userChunks = chunkArray(userList, 10); // Split into chunks of 10
          const results = [];

          for (const chunk of userChunks) {
            const querySnapshot = await getDocs(
              query(
                usersRef,
                where(field, "array-contains-any", chunk),
                limit(limitCount)
              )
            );

            querySnapshot.forEach(doc => {
              results.push({ ...doc.data(), id: doc.id });
            });
          }
          return results;
        };

        // Get the list of user's followers
        const userDoc = await getDoc(doc(firestore, "users", authUser.uid));
        const userData = userDoc.data();
        const userFollowers = userData.followers || [];
        const followingUsers = authUser.following || [];

        // Fetch users who are following the user's followers
        const followersFollowingUsers = await fetchUsers("following", userFollowers, 100);

        // Fetch users who are followed by the same users that the auth user follows
        const followingUsersResults = await fetchUsers("followers", followingUsers, 100);

        // Combine and deduplicate the suggested users
        const combinedUsers = [...followersFollowingUsers, ...followingUsersResults];

        // Remove duplicate users
        const uniqueUsers = combinedUsers.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );

        // Filter out the authUser and users that the authUser is following
        const uniqueSuggestedUsers = uniqueUsers.filter(
          (user) => ![authUser.uid, ...authUser.following].includes(user.uid)
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
