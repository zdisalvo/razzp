// src/components/ForgotPasswordModal.js
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
  Input,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { auth } from "../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Button onClick={onOpen} variant="link" >
        Forgot your password?
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={"black"} border={"1px solid gray"} maxW={{ base: "90vw", md: "400px" }} px={0}>
          <ModalHeader>Reset Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Enter your email to reset your password:</Text>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              mb={4}
            />
            {message && <Text mt={4}>{message}</Text>}
          </ModalBody>

          <ModalFooter>
            <Button onClick={handlePasswordReset} 
                bg={"#eb7734"}
                color={"white"}
                _hover={{ bg: "#c75e1f" }}
                textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
                size={{ base: "sm", md: "sm" }}
                mr={3}
                >
              Send Email
            </Button>
            <Button onClick={onClose}
                color={"white"}
                
                textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
                size={{ base: "sm", md: "sm" }}
            >Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ForgotPasswordModal;
