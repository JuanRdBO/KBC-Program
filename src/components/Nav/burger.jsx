import React, { useState } from 'react';
import styled from 'styled-components';
import RightNav from './rightNav';

const StyledBurger = styled.div`
  width: 2rem;
  height: 2rem;
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 200;
  display: none;
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    flex-flow: column nowrap;
  }
  div {
    width: 2rem;
    height: 0.25rem;
    background-color: ${({ open }) => open ? '#fff' : '#333'};
    border-radius: 10px;
    transform-origin: 10px 10px 10px 10px;
    transition: all 0.1s linear;
    &:nth-child(1) {
      transform: ${({ open }) => open ? 'rotate(60deg)' : 'rotate(0)'};
    }
    &:nth-child(2) {
      transform: ${({ open }) => open ? 'translateX(100%)' : 'translateX(0)'};
      opacity: ${({ open }) => open ? 0 : 1};
    }
    &:nth-child(3) {
      transform: ${({ open }) => open ? 'rotate(-45deg)' : 'rotate(0)'};
      opacity: ${({ open }) => open ? 0 : 1};
    }
  }
  div:hover {
    cursor: pointer;
  }
`;

const Burger = () => {
  const [open, setOpen] = useState(false)
  
  return (
    <>
    <StyledBurger open={open} onClick={() => setOpen(!open)}>
      <div>
        <div className="hamburger-div"/>
        <div className="hamburger-div" />
        <div className="hamburger-div" />
      </div>
    </StyledBurger>
      <RightNav open={open}/>
    </>
  )
};

export default Burger;