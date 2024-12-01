import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

const PurpleIconButton = ({
  icon = <FontAwesomeIcon icon={faGear} />,
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
  borderRadius = '25px',
  ...props
}) => {
  return (
    <IconButton
      icon={icon}
      bg={bg}
      color={color}
      size={size}
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
