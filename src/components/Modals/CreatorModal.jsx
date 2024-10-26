import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
} from "@chakra-ui/react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../../firebase/firebase"; // Your Firebase setup
import useAuthStore from "../../store/authStore"; // Auth context/store

const CreatorModal = ({ isOpen, onClose }) => {
  const authUser = useAuthStore((state) => state.user);
  const [creatorEarnings, setCreatorEarnings] = useState({
    gross: authUser?.creatorGross || 0,
    net: authUser?.creatorNet || 0,
    payments: authUser?.creatorPayments || 0,
    balance: (authUser?.creatorNet || 0) - (authUser?.creatorPayments || 0),
  });

  const requestPayout = async () => {
    if (creatorEarnings.balance > 0) {
      const userRef = doc(firestore, "users", authUser.uid);
      await updateDoc(userRef, {
        creatorPayments: increment(creatorEarnings.balance),
        creatorBalance: 0, // Reset balance to 0
      });

      setCreatorEarnings({ balance: 0 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Earnings Overview</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              Total Gross Earnings: ${creatorEarnings.gross.toFixed(2)}
            </Text>
            <Text>Net Earnings: ${creatorEarnings.net.toFixed(2)}</Text>
            <Text>Payments: ${creatorEarnings.payments.toFixed(2) || 0.00}</Text>
            <Text>Balance: ${creatorEarnings.balance.toFixed(2) || 0.00}</Text>
            <Button
              mt={2}
              colorScheme="blue"
              onClick={requestPayout}
              isDisabled={creatorEarnings.balance === 0}
            >
              Request Payout
            </Button>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatorModal;
