import { Box, Link, Tooltip, Image } from "@chakra-ui/react";
import { NotificationsLogo } from "../../assets/constants";
import { Link as RouterLink } from "react-router-dom";
import FireHeartIcon from "./FireHeartIcon";
import useGetNewMatchesCount from "../../hooks/useGetNewMatchesCount";

const SparkMatches = () => {
	const newMatchesCount = useGetNewMatchesCount();

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
				gap={2}
				_hover={{ bg: "whiteAlpha.400" }}
				borderRadius={6}
				p={2}
				ml={0}
				w={{ base: 10, md: "full" }}
				justifyContent={{ base: "center", md: "flex-start" }}
			>
                {/* <Box >
				<Image 
				width="40px"
				src="/matches.png" />
                </Box> */}
				<Box position="relative">
				<FireHeartIcon />
				{newMatchesCount > 0 && (
                    <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    bg="red.500"
                    color="white"
                    borderRadius="full"
                    width="20px"
                    height="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="12px"
                    fontWeight="bold"
                  >
                        {newMatchesCount}
                    </Box>
                )}
				</Box>
				<Box display={{ base: "none", md: "block" }}>Match</Box>
			</Link>
		</Tooltip>
	);
};

export default SparkMatches;
