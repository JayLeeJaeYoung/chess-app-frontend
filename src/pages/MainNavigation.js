import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../util/auth-context";
import "./MainNavigation.css";

const NavLinks = (props) => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/lobby">Lobby</NavLink>
      </li>
      <li>
        <NavLink to="/game">My Game</NavLink>
      </li>
      <li className="logout">
        <button onClick={auth.logout}>LOGOUT</button>
      </li>
    </ul>
  );
};

const MainHeader = (props) => {
  return <header className="main-header">{props.children}</header>;
};

const MainNavigation = () => {
  return (
    <MainHeader>
      <h1>Chess</h1>
      <NavLinks />
    </MainHeader>
  );
};

export default MainNavigation;
