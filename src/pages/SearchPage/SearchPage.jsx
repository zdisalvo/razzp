import React, { useState } from "react";
import { Box, Button, Container, Flex, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import useSearchUser from "../../hooks/useSearchUser";
import { Link as RouterLink } from "react-router-dom";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const { isLoading, getUserProfiles, users } = useSearchUser();

  const handleSearch = () => {
    if (query.trim()) {
      getUserProfiles(query.trim());
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={4}>
        <Flex w="full" gap={2}>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users"
            size="md"
          />
          <Button onClick={handleSearch} isLoading={isLoading} colorScheme="blue">
            Search
          </Button>
        </Flex>

        {isLoading && <Spinner size="xl" />}

        {!isLoading && users.length === 0 && (
          <Text>No users found. Try a different search query.</Text>
        )}

        {!isLoading && users.length > 0 && (
          <VStack spacing={4} w="full">
            {users.map((user) => (
              <Box
                key={user.uid}
                p={4}
                w="full"
                borderWidth="1px"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text as={RouterLink} to={`/${user.username}`} fontSize="lg" fontWeight="bold">
                  {user.username}
                </Text>
                <Text>{user.fullName}</Text>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default SearchPage;
