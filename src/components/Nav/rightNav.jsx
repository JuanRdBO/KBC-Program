import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Link as ScrollLink } from 'react-scroll';

const Ul = styled.ul`
  list-style: none;
  display: flex;
  flex-flow: row nowrap;
  li {
    padding: 18px 10px;
  }
  @media (max-width: 768px) {
    flex-flow: column nowrap;
    background-color: rgb(241, 239, 229);
    z-index: 99;
    border: 2px solid black;
    border-radius: 2%;
    position: fixed;
    transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
    top: 0;
    right: 0;
    height: 40vh;
    width: 300px;
    padding-top: 3.5rem;
    transition: transform 0.3s ease-in-out;
    li {
      color: #fff;
    }
  }
`;

const RightNav = ({open}) => {
  return (
    <Ul open={open} className="menu-container">
      <li className="menu-item">
        <ScrollLink className="menu-link" to="learn" spy={true} smooth={true} offset={0} duration={750}>
          <div>Learn</div>
        </ScrollLink>
      </li>

      <li className="menu-item">
        <ScrollLink className="menu-link" to="future" spy={true} smooth={true} offset={0} duration={1250}>
          <div>JOJOs Future</div>
        </ScrollLink>
      </li>
      <li className="menu-item">
        <Link className="menu-link" to="/purpose">
          <div>Purpose</div>
        </Link>
      </li>
    </Ul>
  )
}

export default RightNav