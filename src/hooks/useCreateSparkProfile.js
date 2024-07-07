import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { firestore, storage } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useUserProfileStore from "../store/userProfileStore";
import useSparkStore from "../store/sparkProfileStore";
import useGetSparkProfileById from "./useGetSparkProfileById";

const useCreateSparkProfile = () => {
	const [isUpdating, setIsUpdating] = useState(false);

	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setUser);
	const setUserProfile = useUserProfileStore((state) => state.setUserProfile);

	const { sparkProfile, isLoading } = useGetSparkProfileById(authUser?.uid); 
	const setSparkProfile = useSparkStore((state) => state.setSparkProfile);

	const showToast = useShowToast();

	const editSparkProfile = async (inputs) => {
		if (isUpdating || isLoading || !authUser || !sparkProfile) return;
		setIsUpdating(true);

		//const storageRef = ref(storage, `sparkProfilePics/${authUser.uid}`);
		const userDocRef = doc(firestore, "users", authUser.uid);
		const sparkDocRef = doc(firestore, "spark", authUser.uid);

		let URL = "";
		try {
			// if (selectedFile) {
			// 	await uploadString(storageRef, selectedFile, "data_url");
			// 	URL = await getDownloadURL(ref(storage, `sparkProfilePics/${authUser.uid}`));
			// }

			const updatedSpark = {
				...sparkProfile,
				name: inputs.name || sparkProfile?.name || '',
				created: true,
				birthday: inputs.birthday || sparkProfile?.birthday || '',
				work: inputs.work || sparkProfile?.work || '',
				school: inputs.school || sparkProfile?.school || '',
				gender: inputs.gender || sparkProfile?.gender || '',
				interested_in: inputs.interested_in || sparkProfile?.interested_in || [],
				location: inputs.location || sparkProfile?.location || '',
				hometown: inputs.hometown || sparkProfile?.hometown || '',
				ethnicity: inputs.ethnicity || sparkProfile?.ethnicity || '',
				height: inputs.height || sparkProfile?.height || '',
				exercise: inputs.exercise || sparkProfile?.exercise || '',
				education_level: inputs.education_level || sparkProfile?.education_level || '',
				drinking: inputs.drinking || sparkProfile?.drinking || '',
				smoking: inputs.smoking || sparkProfile?.smoking || '',
				cannabis: inputs.cannabis || sparkProfile?.cannabis || '',
				looking_for: inputs.looking_for || sparkProfile?.looking_for || '',
				family_plans: inputs.family_plans || sparkProfile?.family_plans || '',
				have_kids: inputs.have_kids || sparkProfile?.have_kids || '',
				star_sign: inputs.star_sign || sparkProfile?.star_sign || '',
				politics: inputs.politics || sparkProfile?.politics || '',
				religion: inputs.religion || sparkProfile?.religion || '',
				pronouns: inputs.pronouns || sparkProfile?.pronouns || [],
				languages: inputs.languages || sparkProfile?.languages || [],
				interests: inputs.interests || sparkProfile?.interests || [],
				profilePics: inputs.profilePics || sparkProfile?.profilePics || [],
				uploadedImages: inputs.uploadedImages || sparkProfile?.uploadedImages || [],
				selectedImages: inputs.selectedImages || sparkProfile?.selectedImages || [],
			};

			const updatedUser = {
				...authUser,
				spark: true,
			};

			await updateDoc(sparkDocRef, updatedSpark);
			localStorage.setItem("spark-info", JSON.stringify(updatedSpark));
			setSparkProfile(updatedSpark);

			await updateDoc(userDocRef, updatedUser);
			localStorage.setItem("user-info", JSON.stringify(updatedUser));
			setAuthUser(updatedUser);
			setUserProfile(updatedUser);

			showToast("Success", "Profile updated successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	return { editSparkProfile, isUpdating };
};

export default useCreateSparkProfile;
