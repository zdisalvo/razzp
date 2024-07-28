import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from "../firebase/firebase"; // Adjust the import path as needed

const useUpdateIncomingReadStatus = (userId, receivingUserId) => {
  const [previousViewedData, setPreviousViewedData] = useState(null);

  useEffect(() => {
    const fetchViewedData = async () => {
      try {
        const readRef = doc(firestore, 'razzpRead', userId);
        const readDoc = await getDoc(readRef);

        if (readDoc.exists()) {
          const currentData = readDoc.data();
          setPreviousViewedData(currentData[receivingUserId]);
        }
      } catch (error) {
        console.error('Error fetching read status:', error);
      }
    };

    fetchViewedData();
  }, [userId, receivingUserId]);

  const updateViewedStatus = async () => {
    if (previousViewedData !== null) {
      try {
        const readRef = doc(firestore, 'razzpRead', userId);
        await updateDoc(readRef, {
            [`${receivingUserId}.incomingRead`]: true,
          });
      } catch (error) {
        console.error('Error updating incoming viewed status:', error);
      }
    }
  };

  return { previousViewedData, updateViewedStatus };
};

export default useUpdateIncomingReadStatus;
