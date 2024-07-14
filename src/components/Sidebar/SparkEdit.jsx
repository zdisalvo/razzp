import { Box, Link, Tooltip, Image } from "@chakra-ui/react";
import { NotificationsLogo } from "../../assets/constants";
import { Link as RouterLink } from "react-router-dom";

const SparkEdit = () => {
	return (
		<Tooltip
			hasArrow
			label={"Spark Edit"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", md: "none" }}
		>
			<Link
				display={"flex"}
				to={"/spark/edit"}
				as={RouterLink}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
			>
                <Box fontSize={24}>
				<Image src="/edit-profile-icon-24.png"  />
                </Box>
				<Box display={{ base: "none", md: "block" }}>Profile</Box>
			</Link>
		</Tooltip>
	);
};

export default SparkEdit;
