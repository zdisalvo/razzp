import React from 'react';
import styled from 'styled-components';

// Styled-component for the Metallic RoseGoldButton
const RoseGoldButtonStyle = styled.button`
  background: ${({ bg }) =>
    bg ||
    'linear-gradient(145deg, #f9b8c5, #f3a0b3, #e89896)'}; // Bright metallic rose gold gradient
  color: ${({ color }) => color || 'white'};
  font-size: 16px;
  font-weight: bold;
  border: 1px solid #d0897a; // Rose gold border with metallic effect
  border-radius: 16px;
  padding: 4px 12px;
  cursor: pointer;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.6); // Deeper shadow for metallic effect
  transition: all 0.3s ease;
  text-shadow: ${({ textShadow }) =>
    textShadow || '2px 2px 5px rgba(0, 0, 0, 0.4)'}; // Stronger text shadow to create depth

  /* If size is 'sm', apply smaller padding and font-size */
  ${({ size }) => size === 'sm' && 'font-size: 14px; padding: 10px 20px;'}

  /* Hover State - Making it pop with a brighter effect */
  &:hover {
    background: ${({ _hover }) =>
      _hover?.bg || 'linear-gradient(145deg, #f8d0b6, #e58f77, #d2765c)'}; // Lighter and shinier hover effect
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), inset 0 4px 10px rgba(255, 255, 255, 0.8); // Enhanced inner glow and shadow
  }

  /* Active State - Slightly darker for pressed effect */
  &:active {
    background: ${({ _active }) =>
      _active?.bg || 'linear-gradient(145deg, #e89896, #d5866f, #c17654)'}; // Slightly darker metallic rose gold
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RoseGoldButton = ({ children, ...props }) => {
  return (
    <RoseGoldButtonStyle {...props}>
      {children}
    </RoseGoldButtonStyle>
  );
};

export default RoseGoldButton;
