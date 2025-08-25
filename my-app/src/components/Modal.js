import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) =>
    (theme?.mode === "dark") ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0.5)"}; /* ✅ theme-safe */
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalWrapper = styled.div`
  background: ${({ theme }) => (theme?.mode === "dark" ? "#1e293b" : "white")}; /* ✅ */
  border-radius: 12px;
  max-width: ${({ large }) => (large ? "900px" : "650px")};
  width: 100%;
  max-height: ${({ large }) => (large ? "90vh" : "80vh")};
  padding: 32px;
  box-shadow: ${({ theme }) =>
    (theme?.mode === "dark" ? "0 0 60px rgba(0, 0, 0, 0.9)" : "0 2px 10px rgba(0, 0, 0, 0.3)")}; /* ✅ */
  position: relative;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 24px;
    max-width: 95vw;
    max-height: 95vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 28px;
  color: ${({ theme }) => (theme?.mode === "dark" ? "#cbd5e1" : "#555")}; /* ✅ */
  cursor: pointer;
  &:hover { color: ${({ theme }) => (theme?.mode === "dark" ? "#f87171" : "#000")}; }
  &:focus { outline: 2px solid ${({ theme }) => (theme?.mode === "dark" ? "#f87171" : "#000")}; }
`;

const Modal = ({ isOpen, onClose, children, large = false }) => {
  if (!isOpen) return null;
  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };
  return (
    <Overlay onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <ModalWrapper large={large}>
        <CloseButton onClick={onClose} aria-label="Close modal">&times;</CloseButton>
        {children}
      </ModalWrapper>
    </Overlay>
  );
};
export default Modal;
