import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import useSparkProfileStore from "../store/sparkProfileStore";

const useLogin = () => {
	const showToast = useShowToast();
	const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
	const loginUser = useAuthStore((state) => state.login);
	const sparkProfile = useSparkProfileStore((state) => state.setSparkProfile);


	const login = async (inputs) => {
		if (!inputs.email || !inputs.password) {
			return showToast("Error", "Please fill all the fields", "error");
		}
		try {
			const userCred = await signInWithEmailAndPassword(inputs.email, inputs.password);

			if (userCred) {
				const docRef = doc(firestore, "users", userCred.user.uid);
				const docSnap = await getDoc(docRef);
				localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
				loginUser(docSnap.data());

				const sparkDocRef = doc(firestore, "spark", userCred.user.uid);
				const sparkDocSnap = await getDoc(sparkDocRef);
				localStorage.setItem("spark-info", JSON.stringify(sparkDocSnap.data()));
				sparkProfile(sparkDocSnap.data());
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { loading, error, login };
};

export default useLogin;
