import React, { useState } from 'react';
import { Box, Image, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialImages = [
  { id: '1', src: 'image1.jpg' },
  { id: '2', src: 'image2.jpg' },
  { id: '3', src: 'image3.jpg' },
  { id: '4', src: 'image4.jpg' },
  { id: '5', src: 'image5.jpg' },
  { id: '6', src: 'image6.jpg' },
  { id: '7', src: 'image7.jpg' },
  { id: '8', src: 'image8.jpg' },
  { id: '9', src: 'image9.jpg' },
];

const ProfilePicOrder = ({ isOpen, onClose }) => {
  const [images, setImages] = useState(initialImages);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImages(items);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Drag and Drop Images</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <SimpleGrid columns={3} spacing={4} {...provided.droppableProps} ref={provided.innerRef}>
                  {images.map(({ id, src }, index) => (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          border="1px solid #ccc"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          bg="gray.100"
                          w="100px"
                          h="100px"
                        >
                          <Image src={src} alt={`Image ${id}`} maxW="100%" maxH="100%" />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </SimpleGrid>
              )}
            </Droppable>
          </DragDropContext>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfilePicOrder;