
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useSendMessage = () => {
  const sendMessage = async (userId, matchedUserId, message) => {
    const chatId = `${userId}_${matchedUserId}`;

    const userDocRef = doc(firestore, "sparkMatches", userId);
    const matchedUserDocRef = doc(firestore, "sparkMatches", matchedUserId);

    const messageObject = {
      sender: userId,
      text: message,
      timestamp: new Date(),
    };

    await updateDoc(userDocRef, {
      matches: arrayUnion({
        matchedUserId: matchedUserId,
        messages: arrayUnion(messageObject),
      }),
    });

    await updateDoc(matchedUserDocRef, {
      matches: arrayUnion({
        matchedUserId: userId,
        messages: arrayUnion(messageObject),
      }),
    });
  };

  return sendMessage;
};

export default useSendMessage;
