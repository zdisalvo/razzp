import { Box, Flex, Spinner } from "@chakra-ui/react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Navbar from "../../components/Navbar/Navbar";
import LoadingPage from "../../components/Loading/LoadingPage";


// instead of adding the Sidebar component to every page, we can add it only once to the PageLayout component and wrap the children with it. This way, we can have a sidebar on every page except the AuthPage.

const PageLayout = ({ children }) => {
	const { pathname } = useLocation();
	const [user, loading] = useAuthState(auth);
	const canRenderSidebar = pathname !== "/auth" && user;
	const canRenderNavbar = !user && !loading && pathname !== "/auth";

	const checkingUserIsAuth = !user && loading;
	if (checkingUserIsAuth) return <PageLayoutSpinner />;

	return (
		<Flex flexDir={canRenderNavbar ? "column" : "row"}>
			{/* sidebar on the left */}
			{canRenderSidebar ? (
				<Box w={{ base: "0px", md: "0px" }}>
					<Sidebar />
				</Box>
			) : null}
			{/* Navbar */}
			{canRenderNavbar ? <Navbar /> : null}
			{/* the page content on the right */}
			<Box flex={1} w={{ base: "100vw", md: "100vw" }} h={{ base: "calc(100% - 10vh)", md: "calc(100% - 60px)" }} mx={0}>
				{children}
			</Box>
		</Flex>
	);
};

export default PageLayout;

const PageLayoutSpinner = () => {
	return (
		<Flex flexDir='column' h='100vh' alignItems='center' justifyContent='center'>
			{/* <Spinner size='xl' /> */}
			<LoadingPage />
		</Flex>
	);
};
