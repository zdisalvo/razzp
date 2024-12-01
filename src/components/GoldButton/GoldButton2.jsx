import React from 'react';
import styled from 'styled-components';

// Styled-component for the ShinyGoldButton
const GoldButtonStyle = styled.button`
  background: ${({ bg }) => bg || 'linear-gradient(145deg, #fef6c8, #ccb12e, #e48704)'};
  color: ${({ color }) => color || 'white'};
  font-size: 16px;
  font-weight: bold;
  border: 1px solid #ccb12e;
  border-radius: 16px;
  padding: 4px 12px;
  cursor: pointer;
  outline: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  text-shadow: ${({ textShadow }) => textShadow || '2px 2px 4px rgba(0, 0, 0, 0.5)'};
  ${({ size }) => size === 'sm' && 'font-size: 14px; padding: 10px 20px;'}

  &:hover {
    background: ${({ _hover }) => _hover?.bg || 'linear-gradient(145deg, #f1c40f, #d4af37, #c27c0e)'};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.4);
  }

  &:active {
    background: ${({ _active }) => _active?.bg || 'linear-gradient(145deg, #e1c31d, #b8860b, #8c6d20)'};
    box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GoldButton = ({ children, ...props }) => {
  return (
    <GoldButtonStyle {...props}>
      {children}
    </GoldButtonStyle>
  );
};

export default GoldButton;
