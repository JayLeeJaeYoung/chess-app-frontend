import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "./util/auth-context";

import Auth from "./pages/Auth";
import MainNavigation from "./pages/MainNavigation";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

import styles from "./App.module.css";

const App = () => {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/auth" children={<Auth />} />
          <Redirect to="/auth" />
        </Switch>
      </BrowserRouter>
    );
  } else {
    return (
      <BrowserRouter>
        <div className={styles["app-container"]}>
          <MainNavigation />
          <main>
            <Switch>
              <Route path="/game" children={<Game />} />
              <Route exact path="/lobby" children={<Lobby />} />
              <Redirect to="/lobby" />
            </Switch>
          </main>
        </div>
      </BrowserRouter>
    );
  }
};

export default App;
