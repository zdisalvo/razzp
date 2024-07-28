import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from "../firebase/firebase"; // Adjust the import path as needed

const useUpdateOutgoingReadStatus = (userId, receivingUserId) => {
  const [previousReadData, setPreviousReadData] = useState(null);

  useEffect(() => {
    const fetchReadData = async () => {
      try {
        const readRef = doc(firestore, 'razzpRead', receivingUserId);
        const readDoc = await getDoc(readRef);

        if (readDoc.exists()) {
          const currentData = readDoc.data();
          setPreviousReadData(currentData[userId]);
        }
      } catch (error) {
        console.error('Error fetching read status:', error);
      }
    };

    fetchReadData();
  }, [userId, receivingUserId]);

  const updateReadStatus = async () => {
    if (previousReadData !== null) {
      try {
        const readRef = doc(firestore, 'razzpRead', receivingUserId);
        await updateDoc(readRef, {
          [`${userId}`]: {
            ...previousReadData,
            outgoingRead: true,
          },
        });
      } catch (error) {
        console.error('Error updating outgoing read status:', error);
      }
    }
  };

  return { previousReadData, updateReadStatus };
};

export default useUpdateOutgoingReadStatus;
