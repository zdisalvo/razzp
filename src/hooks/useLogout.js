import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebase";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";


const useLogout = () => {
	const [signOut, isLoggingOut, error] = useSignOut(auth);
	const showToast = useShowToast();
	const logoutUser = useAuthStore((state) => state.logout);
	//const setUserNull = useAuthStore((state) => state.setUser(null));
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			navigate('/auth');
			//setUserNull();
			logoutUser();
			localStorage.removeItem("user-info");

			await signOut();
			
			
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { handleLogout, isLoggingOut, error };
};

export default useLogout;
