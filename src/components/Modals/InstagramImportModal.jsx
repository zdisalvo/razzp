import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Button, Text, Spinner } from '@chakra-ui/react';
import useInstagramDataFetcher from '../../hooks/useInstagramDataFetcher'; // Adjust the path as needed

const ImportInstagramModal = ({ isOpen, onClose }) => {
    const { username, setUsername, items, loading, error, handleSubmit } = useInstagramDataFetcher();

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
                <ModalHeader>Import Instagram Data</ModalHeader>
                <ModalBody 
                    px={{ base: "8px", md: "8px" }} 
                    pt={{ base: 5, md: 8 }} 
                    pb={{ base: 4, md: 5 }}
                >
                    <form onSubmit={handleSubmit}>
                        <FormControl isRequired mb={3}>
                            <FormLabel>Instagram Username</FormLabel>
                            <Input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder="Enter Instagram username"
                            />
                        </FormControl>
                        <Button 
                            type="submit" 
                            bg={"blue.400"}
                            color={"white"} 
                            width="full"
                        >
                            Fetch Data
                        </Button>
                        {loading && <Spinner mt={3} />}
                        {error && <Text color="red.500" mt={3}>{error.message}</Text>}
                        {items.length > 0 && (
                            <div>
                                <Text mt={3} fontWeight="bold">Results for @{username}</Text>
                                <ul>
                                    {items.map((item, index) => (
                                        <li key={index}>
                                            <pre>{JSON.stringify(item, null, 2)}</pre>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ImportInstagramModal;
