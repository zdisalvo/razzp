// SparkProfileModal.js
import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import SparkProfileLite from '../Spark/SparkProfileLite';

const SparkProfileModal = ({ isOpen, onClose, sparkProfile, sparkUser }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} p={0}>
      <ModalOverlay />
      <ModalContent 
      bg={"black"} border={"1px solid gray"} 
      maxW={{ base: "100vw", md: "450px" }}  
      px={{base: "0px", md: "8px"}} pt={3} pb={0} 
      position="absolute"
        top="-50"
      >
        <ModalCloseButton />
        <ModalBody px={{base: "0px", md: "8px"}} pt={5} pb={0}>
          <SparkProfileLite key={sparkProfile.uid} id={sparkProfile.uid} sparkProfile={sparkProfile} sparkUser={sparkUser} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SparkProfileModal;
