import { Box, Link, Tooltip, Image } from "@chakra-ui/react";
import { NotificationsLogo } from "../../assets/constants";
import { Link as RouterLink } from "react-router-dom";

const SparkMatches = () => {
	return (
		<Tooltip
			hasArrow
			label={"Spark Matches"}
			placement='right'
			ml={1}
			openDelay={500}
			display={{ base: "block", md: "none" }}
		>
			<Link
				display={"flex"}
				to={"/spark/matches"}
				as={RouterLink}
				alignItems={"center"}
				gap={4}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={2}
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
			>
                <Box >
				<Image 
				width="110px"
				src="/matches-icon-100.png" />
                </Box>
				<Box display={{ base: "none", md: "block" }}>Matches</Box>
			</Link>
		</Tooltip>
	);
};

export default SparkMatches;
