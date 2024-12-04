import React from 'react';
import { Button } from '@chakra-ui/react';

const GoldButton = ({
  children,
  bg = 'linear-gradient(145deg, #b09c27, #d6c890, #c47603)',
  //bg = 'linear-gradient(145deg, #ccb12e, #fef6c8, #e48704)',
  color = 'white',
  textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)',
  size = 'sm',
  _hover = {
    bg: 'linear-gradient(145deg, #f1c40f, #d4af37, #c27c0e)',
  },
  _active = {
    bg: 'linear-gradient(145deg, #e1c31d, #b8860b, #8c6d20)',
  },
  ...props
}) => {
  return (
    <Button
      bg={bg}
      color={color}
      fontSize="16px"
      fontWeight="bold"
      border="1px solid #ccb12e"
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

export default GoldButton;
