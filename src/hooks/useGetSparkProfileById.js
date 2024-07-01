import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSparkProfileById = (userId) => {
	const [isLoading, setIsLoading] = useState(true);
	const [sparkProfile, setSparkProfile] = useState(null);

	const showToast = useShowToast();

	useEffect(() => {
		const getSparkProfile = async () => {
			setIsLoading(true);
			setSparkProfile(null);
			try {
				const userRef = await getDoc(doc(firestore, "spark", userId));
				if (userRef.exists()) {
					setSparkProfile(userRef.data());
				}
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setIsLoading(false);
			}
		};
		getSparkProfile();
	}, [showToast, setSparkProfile, userId]);

	return { isLoading, sparkProfile, setSparkProfile };
};

export default useGetSparkProfileById;
