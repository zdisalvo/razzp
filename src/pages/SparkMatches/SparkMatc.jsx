// App.jsx or your main component
import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import Matches from "./components/Matches";
import Message from "./components/Message";
import { getMatches } from "./hooks/useSparkChats";

const SparkMatches = () => {
  const [matches, setMatches] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const fetchedMatches = await getMatches(); // Implement getMatches in useSparkChats
      setMatches(fetchedMatches);
    };
    fetchMatches();
  }, []);

  return (
    <Box display="flex">
      <Box width="30%">
        <Matches matches={matches} onChatSelect={(chatId, profile) => {
          setSelectedChatId(chatId);
          setSelectedProfile(profile);
        }} />
      </Box>
      <Box width="70%">
        {selectedChatId && <Message chatId={selectedChatId} sparkProfile={selectedProfile} />}
      </Box>
    </Box>
  );
};

export default SparkMatches;
