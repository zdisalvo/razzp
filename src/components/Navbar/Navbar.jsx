import { Button, Container, Flex, Image, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import GoldButton from "../GoldButton/GoldButton";
import RedButton from "../GoldButton/RedButton";

const Navbar = () => {
	return (
		<Container maxW={"container.lg"} mb={4} mt={"40px"}>
			<Flex w={"full"} justifyContent={{ base: "space-between", sm: "space-between" }} alignItems={"center"}>
				<Link to='/top5'>
				<Box w="120px" h="120px">
				<Image src='/razzp-logo-matte.png' h="auto" 
    			w="auto" display={{ base: "block", sm: "block" }} cursor={"pointer"} />
				</Box>
				</Link>
				<Flex gap={4}>
					<Link to='/auth?mode=login'>
						<GoldButton size={"sm"}
							//bg={"#eb7734"}
							//color={"white"}
							//_hover={{ bg: "#c75e1f" }}
							//textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
							//size={{ base: "sm", md: "sm" }}
							>
							Login
						</GoldButton>
					</Link>
					<Link to='/auth?mode=signup'>
						<RedButton size={"sm"}
							// bg={"#0ba32a"}
							// color={"white"}
							// _hover={{ bg: "#c75e1f" }}
							// textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
						>
							Signup
						</RedButton>
					</Link>
				</Flex>
			</Flex>
		</Container>
	);
};

export default Navbar;
