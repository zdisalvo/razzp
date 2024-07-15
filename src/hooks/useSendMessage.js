import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useSendMessage = () => {
  const sendMessage = async (userId, matchedUserId, messageObject) => {
    const userDocRef = doc(firestore, "sparkMatches", userId);
    const matchedUserDocRef = doc(firestore, "sparkMatches", matchedUserId);

    const userDocSnap = await getDoc(userDocRef);
    const matchedUserDocSnap = await getDoc(matchedUserDocRef);

    let userMatches = [];
    let matchedUserMatches = [];

    if (userDocSnap.exists()) {
      userMatches = userDocSnap.data().matches || [];
    }

    if (matchedUserDocSnap.exists()) {
      matchedUserMatches = matchedUserDocSnap.data().matches || [];
    }

    const updateUserMessages = userMatches.map(match => {
      if (match.matchedUserId === matchedUserId) {
        return {
          ...match,
          messages: match.messages ? [...match.messages, messageObject] : [messageObject],
        };
      }
      return match;
    });

    const updateMatchedUserMessages = matchedUserMatches.map(match => {
      if (match.matchedUserId === userId) {
        return {
          ...match,
          messages: match.messages ? [...match.messages, messageObject] : [messageObject],
        };
      }
      return match;
    });

    await updateDoc(userDocRef, {
      matches: updateUserMessages,
    });

    await updateDoc(matchedUserDocRef, {
      matches: updateMatchedUserMessages,
    });
  };

  return { sendMessage };
};

export default useSendMessage;
