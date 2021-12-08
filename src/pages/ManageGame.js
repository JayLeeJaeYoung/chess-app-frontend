import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Spinner } from "../components/icons";
import Card from "../components/Card";
import Button from "../components/Button";
import Error from "../components/Error";

import useHttpClient from "../util/http-hook";
import { AuthContext } from "../util/auth-context";
import { BASE_URL } from "../util/config";
import { roomActions } from "../store";

import styles from "./ManageGame.module.css";

const WaitingForRequest = () => {
  const myGame = useSelector((state) => state.room.myRoom);
  const rid = myGame._id;

  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const dispatch = useDispatch();

  const cancelRoomHandler = async () => {
    try {
      await sendRequest(BASE_URL + "/api/games/" + rid, "DELETE", null, {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      });
      // console.log("room deleted");
      // console.log(responseData);
      dispatch(roomActions.setMyRoom(undefined));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className={styles["manage-game__wait"]}>
        Please wait until another user requests to join
      </div>
      <br></br>
      <div className={styles["manage-game__wait"]}>
        You can delete your room and join an existing room
      </div>
      {error && <Error message={error} onClick={() => clearError()} />}
      {isLoading && <Spinner />}
      <div className={styles["manage-game__button"]}>
        <Button
          small
          styles="join-game__button"
          onClick={cancelRoomHandler}
          inverse>
          Delete Room
        </Button>
      </div>
    </div>
  );
};

const RespondToRequest = () => {
  const myGame = useSelector((state) => state.room.myRoom);
  const rid = myGame._id;
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const dispatch = useDispatch();

  const participant = myGame.participant;

  const level = myGame.participantLevel;
  let levelString = "Beginner";
  if (Number(level) === 2) levelString = "Intermediate";
  else if (Number(level) === 3) levelString = "Expert";

  const responseHandler = async (accept) => {
    try {
      const responseData = await sendRequest(
        BASE_URL + "/api/games/" + rid + "/respond",
        "PATCH",
        JSON.stringify({
          accept: accept,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      // console.log("room request responded");
      // console.log(responseData);
      dispatch(roomActions.changeMyRoom(responseData.game));
    } catch (err) {
      console.log(err);
    }
  };

  const acceptHandler = () => {
    responseHandler(true);
  };

  const declineHandler = () => {
    responseHandler(false);
  };

  return (
    <div>
      <div className={styles["manage-game__participant"]}>
        {participant} ({levelString}) requests to join the room
      </div>
      {error && <Error message={error} onClick={() => clearError()} />}
      {isLoading && <Spinner />}
      <div className={styles["manage-game__action__button"]}>
        <Button small styles="join-game__button" onClick={acceptHandler}>
          Accept
        </Button>
        <Button
          small
          styles="join-game__button"
          onClick={declineHandler}
          danger>
          Decline
        </Button>
      </div>
    </div>
  );
};

const ManageGame = () => {
  const myGame = useSelector((state) => state.room.myRoom);

  const roomname = myGame.roomname;
  const creator = myGame.creator;
  const participantId = myGame.participantId;

  const level = myGame.level;

  let levelString = "Beginner";
  if (Number(level) === 2) levelString = "Intermediate";
  else if (Number(level) === 3) levelString = "Expert";

  const content = participantId ? <RespondToRequest /> : <WaitingForRequest />;

  return (
    <Card styles="manage-game">
      <div className={styles["manage-game__roomname"]}>{roomname}</div>
      <div className={styles["manage-game__creator"]}>
        Created By: {creator} ({levelString})
      </div>
      {content}
    </Card>
  );
};

export default ManageGame;
