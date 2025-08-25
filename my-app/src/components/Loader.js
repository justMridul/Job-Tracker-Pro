// src/components/Loader.js
import React from "react";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
`;

const Spinner = styled.div`
  border: 5px solid rgba(86, 204, 242, 0.3);
  border-top: 5px solid #56ccf2;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${rotate} 1s linear infinite;
  box-shadow: 0 0 15px #56ccf2;
`;

const Loader = () => (
  <LoaderWrapper role="status" aria-label="Loading Content">
    <Spinner />
  </LoaderWrapper>
);

export default Loader;
