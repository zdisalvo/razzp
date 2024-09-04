import React from 'react';
import { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Button, Text, Progress } from '@chakra-ui/react';
import useInstagramDataFetcher from '../../hooks/useInstagramDataFetcher'; // Adjust the path as needed

const ImportInstagramModal = ({ isOpen, onClose }) => {
    const { username, setUsername, items, loading, progress, error, handleSubmit } = useInstagramDataFetcher();
    const [ isInitialized, setIsInitialized ] = useState(false);

    // useEffect(() => {
    //     if (!loading && !isInitialized && items.length > 0) {
    //         window.location.reload(); // Reload the page
    //         setIsInitialized(true);
    //     }
    // }, [loading, items]);

    // useEffect(() => {
    //     if (!loading && isOpen && items.length > 0) {
    //         onClose(); // Close the modal
    //     }
    // }, [loading, isOpen, items, onClose]);

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
                <ModalHeader>Import Instagram Content</ModalHeader>
                <Text fontSize="sm" color="gray.500" mb={1} textAlign="center">
                    This will take 1-2 minutes in the background
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2} textAlign="center">
                    Instagram profile must be public to import content
                </Text>
                <ModalBody 
                    px={{ base: "8px", md: "8px" }} 
                    pt={{ base: 3, md: 5 }} 
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
                            Import Posts
                        </Button>
                        {loading && (
                            <div>
                                <Text mt={3} mb={2}>Loading...</Text>
                                <Progress value={progress} size="sm" colorScheme="blue" />
                            </div>
                        )}
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
