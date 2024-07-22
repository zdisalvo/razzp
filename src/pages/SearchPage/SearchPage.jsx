import {
    Box,
    FormControl,
    Input,
    VStack,
    Spinner,
    Text,
    Container,
    Flex,
    IconButton,
    Heading,
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
  import useSearchUser from "../../hooks/useSearchUser";
  import SuggestedUser from "../../components/SuggestedUsers/SuggestedUser";
  import { debounce } from "lodash";
  
  const SearchPage = () => {
    const { users, isLoading, getUserProfiles, setUsers } = useSearchUser();
    const [searchQuery, setSearchQuery] = useState("");

    const handleGoBack = () => {
        navigate(-1); // Navigate to the previous page
    };
  
    const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      debounceSearch(query);
    };
  
    const debounceSearch = debounce((query) => {
      if (query.trim() !== "") {
        getUserProfiles(query);
      } else {
        setUsers([]);
      }
    }, 500);
  
    useEffect(() => {
      return () => {
        debounceSearch.cancel();
      };
    }, []);
  
    return (
        <Container top={0} p={0} maxW={{ base: "100vw", md: "100vw" }} pb={{ base: "10vh", md: "60px" }} m={0}>
      <Box padding="4" maxW="3xl" mx="auto">
                <Flex align="center" mb={4}>
                    <IconButton
                        icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
                        aria-label="Go back"
                        variant="ghost"
                        onClick={handleGoBack}
                        mr={4} // Add margin-right to space out from the heading
                    />
                    <Heading as="h1" size="lg">Search</Heading>
                </Flex>
        <FormControl>
          <Input
            placeholder="Search for users..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </FormControl>
        {isLoading && <Spinner mt={4} />}
        {!isLoading && (
          <VStack mt={4} spacing={4}>
            {users.length > 0 ? (
              users.map((user) => (
                <SuggestedUser key={user.uid} user={user} setUser={setUsers} />
              ))
            ) : (
              <Text>No users found</Text>
            )}
          </VStack>
        )}
      </Box>
      </Container>
    );
  };
  
  export default SearchPage;
  