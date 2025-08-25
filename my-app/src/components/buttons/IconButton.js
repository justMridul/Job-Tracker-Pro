import React, { useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import PropTypes from 'prop-types';

// Ripple animation uses slower, softer fade and scale
const rippleEffect = keyframes`
  to {
    opacity: 0;
    transform: scale(4);
  }
`;

const Ripple = styled.span`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  width: 120px;
  height: 120px;
  left: ${(props) => props.x - 60}px;
  top: ${(props) => props.y - 60}px;
  background: rgba(34, 195, 94, 0.15); /* softer green ripple */
  opacity: 0.6;
  transform: scale(0);
  animation: ${rippleEffect} 0.7s cubic-bezier(0.4, 0, 0.2, 1);
`;

const StyledIconButton = styled.button`
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: 
    background-color 0.35s ease, 
    box-shadow 0.35s ease, 
    transform 0.2s ease;
  user-select: none;
  background-color: transparent;

  ${(props) => props.$variantCss}
  ${(props) => props.$sizeCss}

  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
    transform: none;
  }

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: scale(1.15);
    box-shadow: 0 0 12px 2px ${({ theme }) => theme.colors.primary}aa;
    outline: none;
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 3px;
    box-shadow: 0 0 15px 3px ${({ theme }) => theme.colors.secondary}bb;
  }

  /* Danger variant icon color adjustment */
  ${(props) => props.variant === "danger" && css`
    svg {
      fill: ${props.theme.mode === "dark" ? "#ff6b6b" : "white"};
      stroke: ${props.theme.mode === "dark" ? "#ff6b6b" : "white"};
    }
  `}
`;

const variants = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5);

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary}cc;
      box-shadow: 0 6px 22px rgba(37, 99, 235, 0.7);
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.secondary};
    color: white;
    box-shadow: 0 4px 12px rgba(34, 195, 94, 0.5);

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.secondary}cc;
      box-shadow: 0 6px 20px rgba(34, 195, 94, 0.6);
    }
  `,
  outline: css`
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: none;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary};
      color: white;
      box-shadow: 0 0 14px 2px ${({ theme }) => theme.colors.primary}aa;
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.error};
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.error}cc;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.7);
    }
  `,
};

const sizes = {
  sm: css`
    width: 36px;
    height: 36px;
    svg {
      width: 18px;
      height: 18px;
    }
  `,
  md: css`
    width: 44px;
    height: 44px;
    svg {
      width: 22px;
      height: 22px;
    }
  `,
  lg: css`
    width: 52px;
    height: 52px;
    svg {
      width: 26px;
      height: 26px;
    }
  `,
};

const IconButton = ({
  icon,
  size = 'md',
  variant = 'primary',
  disabled = false,
  onClick,
  ariaLabel,
  type = 'button',
  ...rest
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const handleRipple = (e) => {
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev, { x, y, key: Date.now() }]);
  };

  const handleRippleEnd = (key) => {
    setRipples((prev) => prev.filter((r) => r.key !== key));
  };

  const handleClick = (e) => {
    if (!disabled) {
      handleRipple(e);
      if (onClick) onClick(e);
    }
  };

  if (!ariaLabel) {
    console.warn('IconButton: "ariaLabel" prop is required for accessibility.');
  }

  return (
    <StyledIconButton
      ref={buttonRef}
      $variantCss={variants[variant]}
      $sizeCss={sizes[size]}
      disabled={disabled}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      type={type}
      variant={variant}
      {...rest}
    >
      {icon}
      {ripples.map((ripple) => (
        <Ripple
          key={ripple.key}
          x={ripple.x}
          y={ripple.y}
          onAnimationEnd={() => handleRippleEnd(ripple.key)}
        />
      ))}
    </StyledIconButton>
  );
};

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default IconButton;
