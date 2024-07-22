// useSearchUser.js
import { useState } from "react";
import useShowToast from "./useShowToast";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useSearchUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const showToast = useShowToast();

  const getUserProfiles = async (searchQuery) => {
    setIsLoading(true);
    setUsers([]);
    try {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const usersCollection = collection(firestore, "users");
      const usersQuery = query(usersCollection, orderBy("username"));

      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs.map(doc => doc.data());

      const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().startsWith(lowerCaseQuery) ||
        user.fullName.toLowerCase().startsWith(lowerCaseQuery)
      );

	  //console.log(filteredUsers);

      setUsers(filteredUsers);
    } catch (error) {
      showToast("Error", error.message, "error");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, getUserProfiles, users, setUserSearchQuery: setUsers };
};

export default useSearchUser;
