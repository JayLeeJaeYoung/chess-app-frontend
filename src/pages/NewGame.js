import { useContext, useState } from "react";
import { useDispatch } from "react-redux";

import { ReactComponent as Add } from "../components/circle-plus-solid.svg";
import { Spinner } from "../components/icons";
import Error from "../components/Error";
import Card from "../components/Card";
import Button from "../components/Button";
import RadioInput from "../components/RadioInput";
import Input from "../components/Input";

import { VALIDATOR_MAXLENGTH, VALIDATOR_MINLENGTH } from "../util/validators";
import useForm from "../util/form-hook";
import useHttpClient from "../util/http-hook";
import { AuthContext } from "../util/auth-context";
import { BASE_URL } from "../util/config";
import { roomActions } from "../store";

import styles from "./NewGame.module.css";

const NewGame = (props) => {
  const auth = useContext(AuthContext);
  const [newGameMode, setNewGameMode] = useState(false); // open new game room box
  const [submitted, setSubmitted] = useState(false); // true if new game room submit has been clicked

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [userLevel, setUserLevel] = useState("");
  const initialInputs = {
    nickname: { value: "", isValid: true },
    roomname: { value: "", isValid: true },
  };
  const initialFormValidity = false;
  const [formState, inputHandler] = useForm(initialInputs, initialFormValidity);

  const dispatch = useDispatch();
  const openGameHandler = () => {
    setNewGameMode((prev) => !prev);
  };

  const newGameSubmitHandler = async (event) => {
    event.preventDefault();
    if (userLevel === "") {
      setSubmitted(true);
      return;
    } else {
      clearError();
      try {
        const responseData = await sendRequest(
          BASE_URL + "/api/games/new",
          "POST",
          JSON.stringify({
            nickname: formState.inputs.nickname.value,
            roomname: formState.inputs.roomname.value,
            level: userLevel,
          }),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        );
        // console.log("new room created");
        // console.log(responseData);
        dispatch(roomActions.setMyRoom(responseData.game));
        setNewGameMode(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const radioInputHandlder = (event) => {
    setUserLevel(event.target.value);
    // console.log("newroom: " + event.target.value);
  };

  return (
    <Card styles="new-game">
      <div className={styles["new-game-prompt"]}>
        <div className={styles["add-icon-container"]}>
          <Add style={{ width: "inherit", height: "inherit" }} />
        </div>
        <div className={styles["add-title"]}>Open a New Game Room</div>

        <Button inverse small onClick={openGameHandler}>
          {!newGameMode ? "Open" : "Cancel"}
        </Button>
      </div>
      {newGameMode && (
        <form onSubmit={newGameSubmitHandler}>
          <Input
            element="input"
            id="nickname"
            type="text"
            label="Your Nickname"
            validators={[VALIDATOR_MINLENGTH(1), VALIDATOR_MAXLENGTH(10)]}
            errorText="You must enter nickname of maximum length 10"
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="roomname"
            type="text"
            label="Please name your game room"
            validators={[VALIDATOR_MINLENGTH(1), VALIDATOR_MAXLENGTH(10)]}
            errorText="You must enter room name of maximum length 10"
            onInput={inputHandler}
          />
          <RadioInput
            name="level"
            prompt="Please select your experience level"
            values={[1, 2, 3]}
            labels={["Beginner", "Intermediate", "Expert"]}
            isTouched={submitted}
            value={userLevel}
            onInput={radioInputHandlder}
            errorText="Please select your experience level"
          />
          {error && <Error message={error} onClick={() => clearError()} />}
          {isLoading && <Spinner />}
          <div className={styles["new-game-submit"]}>
            <Button type="submit" disabled={!formState.isValid && !submitted}>
              Submit
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default NewGame;
