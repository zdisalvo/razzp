import { Container, Flex, VStack, Box, Image } from "@chakra-ui/react";
import AuthForm from "../../components/AuthForm/AuthForm";
import Meta from "../../components/SEO/Meta";

const AuthPage = () => {
	return (
		<div>
		<Meta title="Sign up on Razzp - Social Networking Reinvented" 
			keywords="Social network, Social media platform, Content creation, Online community, Connect with local friends, Share updates, Search by location, Messaging, Social media, Profile creation, Social sharing, Friend network, Social interaction, Content sharing, User engagement, Social connections, Follow and unfollow, Online profiles, News feed, Social networking site" 
			description="The ultimate platform for creating and sharing content. Connect with local users, increase your popularity, and maximize your brand on Razzp. No download required." 
			ogTitle="Sign up on Razzp - Social Networking Reinvented"
			ogDescription="The ultimate platform for creating and sharing content. Connect with local users, increase your popularity, and maximize your brand on Razzp. No download required."
			ogImage="https://razz-p.web.app/razzp-logo-matte.png"
			
			/>
		
		<Flex minH={"100vh"} justifyContent={"center"} alignItems={"center"} px={4}>
			<Container maxW={"container.md"} padding={0}>
				<Flex justifyContent={"center"} alignItems={"center"} gap={10}>
					{/* Left hand-side */}
					<Box display={{ base: "none", md: "block" }}>
						<Image src='/razzp-logo-matte.png' h={250} alt='Mobile logo' />
					</Box>

					{/* Right hand-side */}
					<VStack spacing={4} align={"stretch"}>
						<AuthForm />
						{/* <Box textAlign={"center"}>Get the app.</Box>
						<Flex gap={5} justifyContent={"center"}>
							<Image src='/playstore.png' h={"10"} alt='Playstore logo' />
							<Image src='/microsoft.png' h={"10"} alt='Microsoft logo' />
						</Flex> */}
					</VStack>
				</Flex>
			</Container>
		</Flex>
		</div>
	);
};

export default AuthPage;
