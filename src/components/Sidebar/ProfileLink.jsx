import { Avatar, Box, Link, Tooltip, useColorModeValue} from "@chakra-ui/react";
import { Link as RouterLink, useLocation} from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProfileLink = () => {
	const authUser = useAuthStore((state) => state.user);

	const location = useLocation();

  	
  	const activeColor = "#15f4EE";
	const activeStyles = {
		fontWeight: "bold",
		activeColor,
	  };

	return (
		<Tooltip
			hasArrow
			label={"Profile"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", md: "none" }}
		>
			<Link
				display={"flex"}
				to={`/${authUser?.username}`}
				as={RouterLink}
				alignItems={"center"}
				gap={3}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={1}
				ml={0}
				mr={0}
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
				//color={location.pathname === `/${authUser?.username}` ? activeColor : "inherit"}
				color="inherit"
				//_active={activeStyles} // Apply active styles
        		//_focus={activeStyles} // Apply active styles
			>
				<Avatar size={"sm"} src={authUser?.profilePicURL || ""} />
				<Box display={{ base: "none", md: "block" }} >Profile</Box>
				{/* style={location.pathname === `/${authUser?.username}` ? activeStyles : {}} */}
			</Link>
		</Tooltip>
	);
};

export default ProfileLink;
