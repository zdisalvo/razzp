import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";

const useSignUpWithEmailAndPassword = () => {
	const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.login);

	const signup = async (inputs) => {
		if (!inputs.email || !inputs.password || !inputs.username || !inputs.fullName) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}

		const usersRef = collection(firestore, "users");

		const q = query(usersRef, where("username", "==", inputs.username));
		const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty) {
			showToast("Error", "Username already exists", "error");
			return;
		}

		try {
			const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
			if (!newUser && error) {
				showToast("Error", error.message, "error");
				return;
			}
			if (newUser) {
				const spark = {
					uid: newUser.user.uid,
					name: "",
					bio: "",
					created: false,
					birthday: "",
					work: "",
					school: "",
					gender: "",
					interested_in: [],
					location: "",
					hometown: "",
					ethnicity: "",
					height: 0,
					exercise: "",
					education_level: "",
					drinking: "",
					smoking: "",
					cannabis: "",
					looking_for: "",
					family_plans: "",
					have_kids: "",
					star_sign: "",
					politics: "",
					religion: "",
					pronouns: [],
					languages: [],
					photos: [],
					interests: [],
					profilePics: [],
					uploadedImages: [],
					selectedImages: [],

					viewed1x: [],
					viewed2x: [],
					viewed3x: [],
					liked: [],
					crowned: [],
					crownedMe: [],
					dayLikes: 0,
					likeClock: "",
					dayCrowns: 0,
					crownClock: "",
					likedMe: [],
					matched: [],
					ratings: [],
					totalScore: 0,
					filters: [],
					blocked: [],
					blockedMe: [],
				}

				const userDoc = {
					uid: newUser.user.uid,
					email: inputs.email,
					username: inputs.username.toLowerCase(),
					fullName: inputs.fullName,
					bio: "",
					profilePicURL: "",
					followers: [],
					following: [],
					requested: [],
					posts: [],
					createdAt: Date.now(),
					geohash: "",
					spark: false,
					dayCrowns: 0,
					private: false,
				};
				await setDoc(doc(firestore, "spark", newUser.user.uid), spark);
				localStorage.setItem("spark-profile", JSON.stringify(spark));

				await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);
				localStorage.setItem("user-info", JSON.stringify(userDoc));
				loginUser(userDoc);

				
				
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;
