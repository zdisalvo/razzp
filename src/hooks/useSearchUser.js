import { useState } from "react";
import useShowToast from "./useShowToast";
import { collection, getDocs, query, where, orderBy, startAt, endAt } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useSearchUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const showToast = useShowToast();

  const getUserProfiles = async (searchQuery) => {
    setIsLoading(true);
    setUsers([]);
    try {
      const usersCollection = collection(firestore, "users");

      const usernameQuery = query(
        usersCollection,
        orderBy("username"),
        startAt(searchQuery),
        endAt(searchQuery + "\uf8ff")
      );

      const nameQuery = query(
        usersCollection,
        orderBy("name"),
        startAt(searchQuery),
        endAt(searchQuery + "\uf8ff")
      );

      const [usernameSnapshot, nameSnapshot] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(nameQuery)
      ]);

      const usernameResults = usernameSnapshot.docs.map(doc => doc.data());
      const nameResults = nameSnapshot.docs.map(doc => doc.data());

      const combinedResults = [...usernameResults, ...nameResults];
      const uniqueResults = Array.from(new Set(combinedResults.map(user => user.uid)))
        .map(uid => combinedResults.find(user => user.uid === uid));

      if (uniqueResults.length === 0) return showToast("Error", "User not found", "error");

      setUsers(uniqueResults);
    } catch (error) {
      showToast("Error", error.message, "error");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, getUserProfiles, users, setUsers };
};

export default useSearchUser;
