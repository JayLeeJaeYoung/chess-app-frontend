import { createContext, useCallback, useState, useEffect } from "react";

let logoutTimer;

export const AuthContext = createContext({
  isLoggedIn: false, // if it is logged in userId and token will be non-null
  userId: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthContextProvider = (props) => {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  // not exposed outside the hook
  const [tokenExpirationDate, setTokenExpirationDate] = useState();

  const login = useCallback(async (uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    // if no expirationData set then set 3 hours (must match backend)
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60 * 3);
    setTokenExpirationDate(tokenExpirationDate);

    // store to browser's local storage
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    // it does not inform the backend, so the socket connection will be live for some time after
    // user logs out but if the same user logs back in, the old socket will be cleared
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  // set timer to automatically logout after expiration date
  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  // automatically log in if you are already logged in when you refersh browser
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (storedData?.token && new Date(storedData.expiration) > new Date()) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  // isLoggedIn must be !!token && !!userId because for some timing reason
  // token was set before userId and the socket connection was made without userId
  // but we know socket connection can be made only when isLoggedIn is true
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token && !!userId,
        userId: userId,
        token: token,
        login: login,
        logout: logout,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
};
