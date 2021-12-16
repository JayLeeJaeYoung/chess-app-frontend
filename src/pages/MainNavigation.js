import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { NavLink } from "react-router-dom";
import { AuthContext } from "../util/auth-context";
import "./MainNavigation.css";

const NavLinks = (props) => {
  const auth = useContext(AuthContext);
  const myGame = useSelector((state) => state.room.myRoom);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/lobby">Lobby</NavLink>
      </li>
      {myGame?.started && (
        <li>
          <NavLink to="/game">My Game</NavLink>
        </li>
      )}
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
