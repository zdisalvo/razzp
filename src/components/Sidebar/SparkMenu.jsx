import { Box, Link, Tooltip, Image } from "@chakra-ui/react";
import { NotificationsLogo } from "../../assets/constants";
import { Link as RouterLink } from "react-router-dom";

const SparkMenu = () => {
	return (
		<Tooltip
			hasArrow
			label={"Spark"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", md: "none" }}
		>
			<Link
				display={"flex"}
				to={"/spark"}
				as={RouterLink}
				alignItems={"center"}
				gap={3}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={1}
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
			>
				<Box >
				<Image 
				width="100px"
				src="/firework3.png" />
                </Box>
				<Box display={{ base: "none", md: "block" }}>Spark</Box>
			</Link>
		</Tooltip>
	);
};

export default SparkMenu;
