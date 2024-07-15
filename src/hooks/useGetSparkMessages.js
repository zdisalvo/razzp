import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSparkMessages = (userId, matchedUserId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userDocRef = doc(firestore, "sparkMatches", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userMatches = userDocSnap.data().matches || [];
          const matchedUserMatch = userMatches.find(match => match.matchedUserId === matchedUserId);
          if (matchedUserMatch) {
            setMessages(matchedUserMatch.messages || []);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId, matchedUserId]);

  return { messages, isLoading };
};

export default useGetSparkMessages;
