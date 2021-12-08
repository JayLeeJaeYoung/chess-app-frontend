import { useState, useCallback, useRef, useEffect } from "react";

// notice this hook will cause the app to load 3 times - initial, when isLoading is true, when isLoading is false
const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // https://reactjs.org/docs/hooks-reference.html
  // keeping track of any mutable value around
  const activeHttpRequests = useRef([]);

  // useCallback to prevent infinite loop
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);

      // intentional delay for debuggin
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // keep track of aborted requests when user moves away before server responds
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });

        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        // response.ok if status is 200-299
        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  // clean up
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};

export default useHttpClient;
