import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";

const useGetNewMatchesCount = () => {
    const [newMatchesCount, setNewMatchesCount] = useState(0);
    const authUser = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchMatches = async () => {
            if (!authUser || !authUser.uid) return;

            try {
                const userRef = doc(firestore, "spark", authUser.uid);
                const userDoc = await getDoc(userRef);

                const matchRef = doc(firestore, "sparkMatches", authUser.uid);
                const matchDoc = await getDoc(matchRef);

                if (!matchDoc.exists()) return;

                if (!userDoc.exists()) return;

                const userData = userDoc.data();
                const matchData = matchDoc.data();

                const checkedMatches = userData.checkedMatches || 0;
                const matches = matchData.matches || [];

                const newCount = matches.filter(match => {
                    const matchTime = match.createdAt;
                    return matchTime > checkedMatches;
                }).length;

                setNewMatchesCount(newCount);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchMatches();
    }, [authUser]);

    //console.log(newNotificationsCount);

    return newMatchesCount;
};

export default useGetNewMatchesCount;
