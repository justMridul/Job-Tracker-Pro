// src/components/buttons/Button.js
import React from 'react';
import styled, { css } from 'styled-components';

// Define color variants with subtle gradients and modern colors
const variants = {
  primary: css`
    background: linear-gradient(90deg, #2563eb 70%, #22c55e 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background: linear-gradient(90deg, #22c55e 70%, #2563eb 100%);
      box-shadow: 0 6px 20px rgba(34, 195, 94, 0.5);
      outline: none;
    }
  `,
  secondary: css`
    background-color: #e4e9f0;
    color: #33475b;
    box-shadow: none;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: #d0d7df;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      outline: none;
    }
  `,
  outline: css`
    background-color: transparent;
    border: 2px solid #2563eb;
    color: #2563eb;
    box-shadow: none;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: #2563eb;
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      outline: none;
    }
  `,
  danger: css`
    background-color: #ef4444;
    color: white;
    box-shadow: none;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: #dc2626cc; /* 80% opacity */
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5);
      outline: none;
    }
  `,
};

// Define size variants with comfortable padding and font sizes
const sizes = {
  sm: css`
    padding: 8px 16px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  md: css`
    padding: 12px 24px;
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  `,
  lg: css`
    padding: 16px 32px;
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
};

const StyledButton = styled.button`
  border: none;
  border-radius: 9999px; /* fully rounded to mimic pills */
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: background-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-weight: 600;
  ${(props) => variants[props.variant || 'primary']}
  ${(props) => sizes[props.size || 'md']}

  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 3px;
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  ariaLabel,
  ...rest
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      type={type}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
