import { Flex, Image, Text } from "@chakra-ui/react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase/firebase";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import { doc, getDoc, setDoc } from "firebase/firestore";

const GoogleAuth = ({ prefix }) => {
	const [signInWithGoogle, , , error] = useSignInWithGoogle(auth);
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.login);

	const handleGoogleAuth = async () => {
		try {
			const newUser = await signInWithGoogle();
			if (!newUser && error) {
				showToast("Error", error.message, "error");
				return;
			}
			const userRef = doc(firestore, "users", newUser.user.uid);
			const userSnap = await getDoc(userRef);

			if (userSnap.exists()) {
				// login
				const userDoc = userSnap.data();
				localStorage.setItem("user-info", JSON.stringify(userDoc));
				loginUser(userDoc);
			} else {
				// signup
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
					email: newUser.user.email,
					username: newUser.user.email.split("@")[0],
					fullName: newUser.user.displayName,
					bio: "",
					profilePicURL: newUser.user.photoURL,
					followers: [],
					following: [],
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

	return (
		<Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"} onClick={handleGoogleAuth}>
			<Image src='/google.png' w={5} alt='Google logo' />
			<Text mx='2' color={"blue.500"}>
				{prefix} with Google
			</Text>
		</Flex>
	);
};

export default GoogleAuth;
