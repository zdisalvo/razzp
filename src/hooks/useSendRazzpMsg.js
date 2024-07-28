import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useSendRazzpMsg = () => {
  const sendMessage = async (userId, receivingUserId, messageObject) => {
    const userDocRef = doc(firestore, "razzpMessages", userId);
    const receivingUserDocRef = doc(firestore, "razzpMessages", receivingUserId);

    // Create the message instance for both users if they don't exist
    const ensureRazzpMessagesInstance = async (docRef, otherUserId) => {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const newUserData = {
          uid: docRef.id,
          messages: [
            {
              receivingUserId: otherUserId,
              messages: [],
            },
          ],
        };
        await setDoc(docRef, newUserData);
      }
    };

    // Ensure both user and receiving user documents exist
    await Promise.all([
      ensureRazzpMessagesInstance(userDocRef, receivingUserId),
      ensureRazzpMessagesInstance(receivingUserDocRef, userId),
    ]);

    // Get the current messages
    const userDocSnap = await getDoc(userDocRef);
    const receivingUserDocSnap = await getDoc(receivingUserDocRef);

    let userMessages = userDocSnap.data().messages || [];
    let receivingUserMessages = receivingUserDocSnap.data().messages || [];

    // Update user messages
    const updatedUserMessages = userMessages.map(convo => {
      if (convo.receivingUserId === receivingUserId) {
        return {
          ...convo,
          messages: [...(convo.messages || []), messageObject],
        };
      }
      return convo;
    });


    // Add new conversation if it does not exist
    if (!updatedUserMessages.some(convo => convo.receivingUserId === receivingUserId)) {
      updatedUserMessages.push({
        receivingUserId: receivingUserId,
        messages: [messageObject],
      });
    }

    // Update receiving user messages
    const updatedReceivingUserMessages = receivingUserMessages.map(convo => {
      if (convo.receivingUserId === userId) {
        return {
          ...convo,
          messages: [...(convo.messages || []), messageObject],
        };
      }
      return convo;
    });

    // Add new conversation if it does not exist
    if (!updatedReceivingUserMessages.some(convo => convo.receivingUserId === userId)) {
      updatedReceivingUserMessages.push({
        receivingUserId: userId,
        messages: [messageObject],
      });
    }

    try {
      const readRef = doc(firestore, "razzpRead", userId);
  
      // Fetch the current document to check if it exists
      const readDoc = await getDoc(readRef);
  
      if (readDoc.exists()) {
        // Update the read status for the receiving user
        await updateDoc(readRef, {
          [`${receivingUserId}.read`]: false,
        });
      } else {
        // Create the document with the read status for the receiving user
        await setDoc(readRef, {
          [receivingUserId]: { read: false },
        });
      }
    } catch (error) {
      console.error("Error updating read status:", error);
    }


// try {
//       const readRef = doc(firestore, "razzpRead", userId);
  
//       // Fetch the current document to check if it exists
//       const readDoc = await getDoc(readRef);
  
//       if (readDoc.exists()) {
//         // Update the read status for the receiving user
//         await updateDoc(readRef, {
//           [`${receivingUserId}.outgoingRead`]: false,
//         });
//       } else {
//         // Create the document with the read status for the receiving user
//         await setDoc(readRef, {
//           [receivingUserId]: { outgoingRead: false },
//         });
//       }
//     } catch (error) {
//       console.error("Error updating outgoing read status:", error);
//     }

//     try {
//       const readRef = doc(firestore, "razzpRead", receivingUserId);
  
//       // Fetch the current document to check if it exists
//       const readDoc = await getDoc(readRef);
  
//       if (readDoc.exists()) {
//         // Update the read status for the receiving user
//         await updateDoc(readRef, {
//           [`${userId}.incomingRead`]: false,
//         });
//       } else {
//         // Create the document with the read status for the receiving user
//         await setDoc(readRef, {
//           [userId]: { incomingRead: false },
//         });
//       }
//     } catch (error) {
//       console.error("Error updating read status:", error);
//     }

    // Update the user document
    await updateDoc(userDocRef, {
      messages: updatedUserMessages,
    });

    // Update the receiving user's document
    await updateDoc(receivingUserDocRef, {
      messages: updatedReceivingUserMessages,
    });
  };

  return { sendMessage };
};

export default useSendRazzpMsg;
