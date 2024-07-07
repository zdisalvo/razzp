import { Box, Button, Flex, Link, Tooltip, useColorModeValue, Image } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
//import {Logo} from "../../assets/Logo";

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
		width={{base: "100vw", md: "70vw"}}
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
      <Flex direction={"row"} justifyContent={"center"} alignItems={"center"} w='full' height="100%" gap={4}>
        <Link ml={2} to={"/"} as={RouterLink} pl={2} display={{ base: "none", md: "flex" }} cursor='pointer' >
          <Image src="../../../dist/logo.png" />
        </Link>
        <Link
          to={"/"}
          as={RouterLink}
          p={2}
          display={{ base: "block", md: "none" }}
          borderRadius={6}
          _hover={{
            bg: "whiteAlpha.200",
          }}
          w={10}
          cursor='pointer'
        >
          <Image src="../../../dist/razzp-mobile-logo.png" />
        </Link>
        <Flex direction={"row"} gap={5} cursor={"pointer"} justifyContent={"center"}>
          <SidebarItems />
        </Flex>

        {/* LOGOUT */}
        <Tooltip
          hasArrow
          label={"Logout"}
          placement='top'
          ml={1}
          openDelay={500}
          display={{ base: "block", md: "none" }}
          mr={2}
        >
          <Flex
            onClick={handleLogout}
            alignItems={"center"}
            gap={2}
            _hover={{ bg: "whiteAlpha.400" }}
            borderRadius={6}
            p={2}
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
        </Tooltip>
      </Flex>
    </Box>
	
	);
};

export default Sidebar;
