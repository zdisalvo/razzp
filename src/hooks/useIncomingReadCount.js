import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from "../firebase/firebase"; // Adjust the import path as needed

const useIncomingReadCount = (userId) => {
  const [incomingReadCount, setIncomingReadCount] = useState(0);

  useEffect(() => {
    const fetchIncomingReadCount = async () => {
      try {
        const readRef = doc(firestore, 'razzpRead', userId);
        const readDoc = await getDoc(readRef);

        if (readDoc.exists()) {
          const data = readDoc.data();
          let count = 0;

          for (const key in data) {
            if (data[key].incomingRead === false) {
              count++;
            }
          }

          setIncomingReadCount(count);
        } else {
          setIncomingReadCount(0);
        }
      } catch (error) {
        console.error('Error fetching incoming read status:', error);
      }
    };

    fetchIncomingReadCount();
  }, [userId]);

  return incomingReadCount;
};

export default useIncomingReadCount;
