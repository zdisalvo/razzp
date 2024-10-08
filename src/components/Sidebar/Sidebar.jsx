import { Box, Button, Flex, Link, Tooltip, useColorModeValue, Image } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";
import SidebarItems from "./SidebarItems";

const Sidebar = () => {
	const { handleLogout, isLoggingOut } = useLogout();

	//
	const location = useLocation();

  	
  	const activeColor = useColorModeValue("blue.500", "blue.200");

	return (
	
	<Box
		height={{base: "10vh", md: "60px"}}
		width={{base: "100vw", md: "672px"}}
		//alignItems={"center"}
		//justifyContent={"center"}
		borderTop={"1px solid"}
		borderColor={"whiteAlpha.300"}
		py={4}
		position={"fixed"}
		bottom={0}
    
    mx={0}

		left={{ base: 0, md: "50%" }} // Center horizontally on medium and larger screens
      	transform={{ base: "none", md: "translateX(-50%)" }} // Center horizontally on medium and larger screens
      

		//left={0}
		px={{ base: 0, md: 2 }}
		bg={"gray.900"}
		zIndex={10}

    >
      <Flex direction={"row"} justifyContent={"center"} alignItems={"center"} w='full' height="100%" gap={2}>
        {/* <Link ml={2} to={"/"} as={RouterLink} pl={2} display={{ base: "none", md: "none" }} cursor='pointer' >
          <Image src="/logo.png" />
        </Link> */}
        <Link
          to={"/"}
          as={RouterLink}
          p={1}
          ml={3}
          mr={0}
          display={{ base: "block", md: "flex" }}
          borderRadius={6}
          _hover={{
            bg: "whiteAlpha.200",
          }}
          w={{ base: "40px", md: "50px" }}
          cursor='pointer'
        >
          <Image src="/razzp-logo-matte.png" 
          alt="Razzp Logo"
          width={{ base: "40px", md: "50px" }} // Adjust image size
          height={{ base: "40px", md: "50px" }} // Adjust height to match width
          objectFit="contain" // Ensure the image scales properly
          />
        </Link>
        <Flex direction={"row"} gap={5} cursor={"pointer"} justifyContent={"center"}>
          <SidebarItems />
        </Flex>

        {/* LOGOUT */}
        {/* <Tooltip
          hasArrow
          label={"Logout"}
          placement='top'
          ml={3}
          openDelay={500}
          display={{ base: "block", md: "none" }}
          mr={0}
        >
          <Flex
            onClick={handleLogout}
            alignItems={"center"}
            gap={1}
            _hover={{ bg: "whiteAlpha.400" }}
            borderRadius={6}
            p={1}
            cursor='pointer'
            //w={{ base: 10, md: "full" }}
            justifyContent={{ base: "center", md: "center" }}
          >
            <BiLogOut size={25} />
            <Button
              display={{ base: "none", md: "block" }}
              variant={"ghost"}
              _hover={{ bg: "transparent" }}
              isLoading={isLoggingOut}
			  //
			  //px={0}
              //ml={0}
              alignItems="center"
			  fontWeight="normal"
			  color={location.pathname === '/logout' ? activeColor : "inherit"}
            >
              Logout
            </Button>
          </Flex>
        </Tooltip> */}
      </Flex>
    </Box>
	
	);
};

export default Sidebar;
