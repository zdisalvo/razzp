// ContactFormModal.js
import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Textarea, Button, Text } from '@chakra-ui/react';
import emailjs from 'emailjs-com';

const SupportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });
  const [isSent, setIsSent] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_0fxkrfi", // Replace with your EmailJS service ID
        "template_vxp7y5r", // Replace with your EmailJS template ID
        e.target, // Form element
        "JKHP3Ubt-WsxGwwvf" // Replace with your EmailJS user ID
      )
      .then(
        (result) => {
          console.log(result.text);
          setIsSent(true);
          setIsError(false);
          setFormData({ user_name: "", user_email: "", message: "" }); // Clear the form
        },
        (error) => {
          console.log(error.text);
          setIsSent(false);
          setIsError(true);
        }
      );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} p={0}>
      <ModalOverlay />
      <ModalContent 
        bg={"black"} 
        border={"1px solid gray"} 
        maxW={{ base: "90vw", md: "400px" }}  
        px={{ base: "8px", md: "8px" }} 
        pt={3} 
        pb={4}
      >
        <ModalCloseButton />
        <ModalHeader>Contact Us</ModalHeader>
        <ModalBody 
          px={{ base: "8px", md: "8px" }} 
          pt={{ base: 5, md: 8 }} 
          pb={{ base: 4, md: 5 }}
        >
          <form onSubmit={handleSubmit}>
            <FormControl isRequired mb={3}>
              <FormLabel>Name</FormLabel>
              <Input 
                type="text" 
                name="user_name" 
                value={formData.user_name} 
                onChange={handleChange} 
              />
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                name="user_email" 
                value={formData.user_email} 
                onChange={handleChange} 
              />
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Message</FormLabel>
              <Textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
              />
            </FormControl>
            <Button 
              type="submit" 
              bg={"blue.400"}
              color={"white"} 
              width="full"
            >
              Send
            </Button>
            {isSent && <Text color="green.500" mt={3}>Message sent successfully!</Text>}
            {isError && <Text color="red.500" mt={3}>Failed to send message. Please try again later.</Text>}
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SupportModal;
