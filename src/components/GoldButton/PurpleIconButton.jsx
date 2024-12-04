import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

const PurpleIconButton = ({
  icon = <FontAwesomeIcon icon={faGear} />,
  bg = 'linear-gradient(145deg, #9b59b6, #b399d4, #916dd7)', // Lighter purples
  color = '#f8f4fc', // Very light lavender for purple lettering
  textShadow = '2px 2px 4px rgba(0, 0, 0, 0.4)',
  size = 'sm',
  _hover = {
    bg: 'linear-gradient(145deg, #b58ecb, #d1aedf, #a787d8)', // Even lighter shades
  },
  _active = {
    bg: 'linear-gradient(145deg, #8d48a5, #a97bc9, #8054b2)', // Slightly darker than default bg
  },
  borderRadius = '25px',
  ...props
}) => {
  return (
    <IconButton
      icon={icon}
      bg={bg}
      color={color}
      size={size}
      lineHeight="1.4"
      borderRadius={borderRadius}
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
    />
  );
};

export default PurpleIconButton;
