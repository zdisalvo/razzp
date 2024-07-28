import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from "../firebase/firebase"; // Adjust the import path as needed

const useIncomingReadStatus = (userId, receivingUserId) => {
  const [incomingRead, setIncomingRead] = useState(null);

  useEffect(() => {
    const fetchIncomingReadStatus = async () => {
      try {
        const readRef = doc(firestore, 'razzpRead', userId);
        const readDoc = await getDoc(readRef);

        if (readDoc.exists()) {
          const data = readDoc.data();
          const userData = data[receivingUserId];
          setIncomingRead(userData ? userData.incomingRead : null);
        }
      } catch (error) {
        console.error('Error fetching incoming read status:', error);
      }
    };

    fetchIncomingReadStatus();
  }, [userId, receivingUserId]);

  return incomingRead;
};

export default useIncomingReadStatus;
