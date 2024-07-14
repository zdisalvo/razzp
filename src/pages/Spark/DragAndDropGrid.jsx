import React, { useState, useEffect } from 'react';
import { Box, Image, SimpleGrid } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const DragAndDropGrid = ({ images, onDragEnd }) => {
  const [imageList, setImageList] = useState(images);

  useEffect(() => {
    setImageList(images);
  }, [images]);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
  
    const items = Array.from(imageList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  
    // console.log('Before:', imageList);
    // console.log('After:', items);
  
    setImageList(items);
    onDragEnd(items);
  };

  return (
    
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="droppable-images" direction="horizontal">
        {(provided) => (
          <SimpleGrid
            columns={4}
            spacing={4}
            ref={provided.innerRef}          // Attach the provided.innerRef to the container
            {...provided.droppableProps}     // Spread the provided.droppableProps
          >
            {imageList.map(({ id, imageURL }, index) => (
              <Draggable key={id} draggableId={id} index={index}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}         // Attach the provided.innerRef to the draggable item
                    {...provided.draggableProps}    // Spread the provided.draggableProps
                    {...provided.dragHandleProps}    // Spread the provided.dragHandleProps
                    border="1px solid #ccc"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    bg="gray.100"
                    w="100px"
                    h="100px"
                  >
                    <Image src={imageURL} alt={`Image ${id}`} maxW="100px" maxH="100px" />
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}              
          </SimpleGrid>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragAndDropGrid;
