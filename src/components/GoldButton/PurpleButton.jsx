import React from 'react';
import { Button } from '@chakra-ui/react';

const PurpleButton = ({
  children,
  bg = 'linear-gradient(145deg, #6a0dad, #7f00ff, #551a8b)',
  color = '#e6e6fa', // Light lavender for purple lettering
  textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)',
  size = 'sm',
  _hover = {
    bg: 'linear-gradient(145deg, #7b1fac, #8a2be2, #5a189a)',
  },
  _active = {
    bg: 'linear-gradient(145deg, #5e0c94, #6800d3, #491578)',
  },
  ...props
}) => {
  return (
    <Button
      bg={bg}
      color={color}
      fontSize="16px"
      fontWeight="bold"
      border="1px solid #7f00ff"
      borderRadius="25px"
      height="auto"
      lineHeight={{base: "2", md: "1.5"}}
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

export default PurpleButton;
