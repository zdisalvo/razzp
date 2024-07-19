import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
//import useGetSparkProfileById from "./useGetSparkProfileById";

const useGetMessagesById = () => {
  const authUser = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const showToast = useShowToast();
  //const { sparkProfile } = useGetSparkProfileById(authUser.uid);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!authUser || !authUser.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const msgDocRef = doc(firestore, "razzpMessages", authUser.uid);
        const msgDoc = await getDoc(msgDocRef);

        if (msgDoc.exists()) {
          setMessages(msgDoc.data().messages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        showToast({
          title: "Error fetching messages",
          description: error.message,
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [authUser, showToast]);

  return { messages, isLoading };
};

export default useGetMessagesById;
