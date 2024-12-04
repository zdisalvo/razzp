import React from 'react';
import { Button } from '@chakra-ui/react';

const RoseGoldButton = ({
  children,
  bg = 'linear-gradient(145deg, #ec9bad, #fbcdd8, #c85f6e)',
  color = 'white',
  textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)',
  size = 'sm',
  _hover = {
    bg: 'linear-gradient(145deg, #f7a7ba, #ee8fa7, #e28487)',
  },
  _active = {
    bg: 'linear-gradient(145deg, #f9b8c5, #d998a3, #d8a2a9)',
  },
  ...props
}) => {
  return (
    <Button
      bg={bg}
      color={color}
      fontSize="16px"
      fontWeight="bold"
      border="1px solid #f3a0b3"
      borderRadius="25px"
      height="auto"
      lineHeight="1.4"
      p="4px 16px"
      textShadow={textShadow}
      boxShadow="0 4px 10px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(255, 255, 255, 0.3)"
      _hover={{
        ..._hover,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.4)',
      }}
      _active={{
        ..._active,
        boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.2)',
      }}
      _disabled={{
        opacity: 0.6,
        cursor: 'not-allowed',
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default RoseGoldButton;
