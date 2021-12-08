import { useContext } from "react";

import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { Spinner } from "../components/icons";

import useForm from "../util/form-hook";
import { VALIDATOR_MINLENGTH } from "../util/validators";
import useHttpClient from "../util/http-hook";
import { AuthContext } from "../util/auth-context";
import { BASE_URL } from "../util/config";

import styles from "./Auth.module.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const initialInputs = { password: { value: "", isValid: false } };
  const initialFormValidity = false;
  const [formState, inputHandler] = useForm(initialInputs, initialFormValidity);

  const submitHandler = async (event) => {
    event.preventDefault();
    clearError();
    try {
      const responseData = await sendRequest(
        BASE_URL + "/api/users/login",
        "POST",
        JSON.stringify({
          password: formState.inputs.password.value,
        }),
        {
          "Content-Type": "application/json",
        }
      );
      await auth.login(responseData.uid, responseData.token, null);
      // console.log("uid: " + responseData.uid);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles["auth-container"]}>
      <div className={styles["title-container"]}>
        <h1>Chess</h1>
      </div>
      <Card>
        {error && <h4 className={styles.error}>Your passcode is incorrect</h4>}
        <form onSubmit={submitHandler}>
          <Input
            element="input"
            id="password"
            type="text"
            label="Please enter the passcode provided by admin"
            validators={[VALIDATOR_MINLENGTH(10)]}
            errorText="hint: passcode is at least 10 characters long"
            onInput={inputHandler}
          />
          <div className={styles["button-container"]}>
            <Button type="submit" disabled={!formState.isValid}>
              Submit
            </Button>
          </div>
        </form>
        {isLoading && <Spinner />}
      </Card>
    </div>
  );
};

export default Auth;
