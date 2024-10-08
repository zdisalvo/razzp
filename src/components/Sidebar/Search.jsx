import {
  Box,
  Button,
  Flex,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchLogo } from "../../assets/constants";
import { Link as RouterLink } from "react-router-dom";

const Search = () => {
  return (
    <Tooltip
      hasArrow
      label={"Search"}
      placement='right'
      ml={3}
      openDelay={500}
      display={{ base: "block", md: "none" }}
    >
      <Flex
        as={RouterLink}
        to="/search"
        alignItems={"center"}
        gap={3}
        _hover={{ bg: "whiteAlpha.400" }}
        borderRadius={6}
        p={2}
		ml={4}
        w={{ base: 10, md: "full" }}
        justifyContent={{ base: "center", md: "flex-start" }}
      >
        <SearchLogo />
        <Box display={{ base: "none", md: "block" }}>Search</Box>
      </Flex>
    </Tooltip>
  );
};

export default Search;
