import { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Spinner } from "../components/icons";
import Card from "../components/Card";
import Button from "../components/Button";
import RadioInput from "../components/RadioInput";
import Input from "../components/Input";
import Error from "../components/Error";

import { VALIDATOR_MAXLENGTH, VALIDATOR_MINLENGTH } from "../util/validators";
import useForm from "../util/form-hook";
import { AuthContext } from "../util/auth-context";
import useHttpClient from "../util/http-hook";
import { BASE_URL } from "../util/config";
import { roomActions } from "../store";

import styles from "./JoinGame.module.css";

const Participate = (props) => {
  const { rid, participantId, declined } = props;
  // initial --> expand ---> waiting --> declined
  const [joinStatus, setJoinStatus] = useState("initial");

  const auth = useContext(AuthContext);
  const [submitted, setSubmitted] = useState(false); // true if join room submit has been clicked

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [userLevel, setUserLevel] = useState("");
  const initialInputs = {
    nickname: { value: "", isValid: true },
  };
  const dispatch = useDispatch();
  const initialFormValidity = false;
  const [formState, inputHandler] = useForm(initialInputs, initialFormValidity);
  const myGame = useSelector((state) => state.room.myRoom);

  useEffect(() => {
    if (joinStatus === "initial" && participantId) {
      setJoinStatus("waiting");
    }
    if (declined) {
      setJoinStatus("declined");
    }
  }, [setJoinStatus, participantId, joinStatus, declined]);

  const joinHandler = () => {
    setJoinStatus("expand");
  };

  const declineHandler = () => {
    setJoinStatus("initial");
    dispatch(roomActions.fromDeclineToInitial(rid));
  };

  const newRoomJoinHandler = async (event) => {
    event.preventDefault();
    if (userLevel === "") {
      setSubmitted(true);
      return;
    } else {
      clearError();
      try {
        const responseData = await sendRequest(
          BASE_URL + "/api/games/" + rid + "/join",
          "PATCH",
          JSON.stringify({
            nickname: formState.inputs.nickname.value,
            level: userLevel,
            rid: rid,
          }),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        );
        // console.log(responseData);
        dispatch(roomActions.changeOtherRooms(responseData.game));
        setJoinStatus("waiting");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const radioInputHandlder = (event) => {
    setUserLevel(event.target.value);
    // console.log("participate: " + event.target.value);
  };

  return (
    <div className={styles["participate-container"]}>
      {joinStatus === "initial" && (
        <Button
          small
          styles="join-game__button"
          onClick={joinHandler}
          disabled={!!myGame}>
          Join
        </Button>
      )}
      {joinStatus === "expand" && (
        <form onSubmit={newRoomJoinHandler}>
          <Input
            element="input"
            id="nickname"
            type="text"
            label="Your Nickname"
            validators={[VALIDATOR_MINLENGTH(1), VALIDATOR_MAXLENGTH(10)]}
            errorText="You must enter nickname of maximum length 10"
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
          <div className={styles["submit-cancel-button"]}>
            <Button type="submit" disabled={!formState.isValid && !submitted}>
              Submit
            </Button>
            <Button
              type="submit"
              danger
              onClick={() => setJoinStatus("initial")}>
              cancel
            </Button>
          </div>
        </form>
      )}
      {joinStatus === "waiting" && (
        <div className={styles["participate__waiting"]}>
          <Spinner />
          <h4>Please wait until the room owner lets you in</h4>
        </div>
      )}
      {joinStatus === "declined" && (
        <div className={styles["participate__declined"]}>
          <h4>
            Sorry, but the creator has declined the request. You could try
            requesting again or try other rooms.
          </h4>
          <Button type="submit" danger onClick={declineHandler}>
            Okay
          </Button>
        </div>
      )}
    </div>
  );
};

const GameItem = (props) => {
  const { roomname, creator, level, started, rid, participantId, declined } =
    props;
  const auth = useContext(AuthContext);
  let levelString = "Beginner";
  if (Number(level) === 2) levelString = "Intermediate";
  else if (Number(level) === 3) levelString = "Expert";

  return (
    <li>
      <Card styles="join-game">
        <div className={styles["join-game__roomname"]}>{roomname}</div>
        <div className={styles["join-game__creator"]}>
          Created By: {creator} ({levelString})
        </div>

        {started && (
          <div className={styles["join-game__button"]}>
            <Button small disabled styles="join-game__button">
              Game in Progress
            </Button>
          </div>
        )}
        {!started && participantId && auth.userId !== participantId && (
          <div className={styles["join-game__button"]}>
            <Button small disabled styles="join-game__button">
              Join Requested
            </Button>
          </div>
        )}
        {!started && (!participantId || auth.userId === participantId) && (
          <Participate
            rid={rid}
            participantId={participantId}
            declined={declined}
          />
        )}
      </Card>
    </li>
  );
};

const GamesList = () => {
  const otherGames = useSelector((state) => state.room.otherRooms);

  if (otherGames.length === 0)
    return (
      <Card>
        <h2>No Rooms to Join</h2>
      </Card>
    );

  return (
    <ul className={styles["games-list-container"]}>
      {otherGames.map((game) => (
        <GameItem
          key={game._id}
          roomname={game.roomname}
          creator={game.creator}
          level={game.level}
          started={game.started}
          creatorId={game.creatorId}
          participantId={game.participantId}
          rid={game._id}
          declined={game.declined}
        />
      ))}
    </ul>
  );
};

const JoinGame = () => {
  return (
    <div className={styles["join-game-container"]}>
      <h3>Join one of the existing Rooms below </h3>
      <GamesList />
    </div>
  );
};

export default JoinGame;
