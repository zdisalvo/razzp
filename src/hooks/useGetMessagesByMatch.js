// useGetMessagesByMatch.js
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetMessagesByMatch = (userId, matchedUserId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const chatId = `${userId}_${matchedUserId}`;
    
    // Create a query for both users' documents
    const fetchMessages = async () => {
      const userDocRef = doc(firestore, "sparkMatches", userId);
      const matchedUserDocRef = doc(firestore, "sparkMatches", matchedUserId);

      const userDocSnap = await getDoc(userDocRef);
      const matchedUserDocSnap = await getDoc(matchedUserDocRef);

      if (userDocSnap.exists()) {
        const userMatches = userDocSnap.data().matches || [];
        const matchedUserMatch = userMatches.find(match => match.matchedUserId === matchedUserId);
        if (matchedUserMatch) {
          setMessages(matchedUserMatch.messages || []);
        }
      }

      if (matchedUserDocSnap.exists()) {
        const matchedUserMatches = matchedUserDocSnap.data().matches || [];
        const userMatch = matchedUserMatches.find(match => match.matchedUserId === userId);
        if (userMatch) {
          setMessages(prevMessages => [...prevMessages, ...(userMatch.messages || [])]);
        }
      }
      
      setIsLoading(false);
    };

    fetchMessages();
  }, [userId, matchedUserId]);

  return { messages, isLoading };
};

export default useGetMessagesByMatch;
