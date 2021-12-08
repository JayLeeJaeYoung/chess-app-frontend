import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { AuthContextProvider } from "./util/auth-context";

import App from "./App";
import store from "./store";
import "./index.css";

ReactDOM.render(
  <AuthContextProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </AuthContextProvider>,
  document.getElementById("root")
);
