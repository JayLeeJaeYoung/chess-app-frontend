import { useCallback, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";

import Button from "../components/Button";
import { Spinner } from "../components/icons";
import Error from "../components/Error";

import { AuthContext } from "../util/auth-context";
import useHttpClient from "../util/http-hook";
import { BASE_URL } from "../util/config";
import socket from "../util/socket-client";
import { roomActions } from "../store";

import NewGame from "./NewGame";
import JoinGame from "./JoinGame";
import ManageGame from "./ManageGame";

import styles from "./Lobby.module.css";

const Lobby = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const dispatch = useDispatch();
  const myGame = useSelector((state) => state.room.myRoom);
  const otherGames = useSelector((state) => state.room.otherRooms);

  const socketEventHandler = useCallback(
    (data) => {
      if (data.action === "create") {
        if (data.game.creatorId !== auth.userId) {
          dispatch(roomActions.addOtherRooms(data.game));
        }
      }
      if (data.action === "delete") {
        if (data.game.creatorId !== auth.userId) {
          dispatch(roomActions.deleteOtherRooms(data.game.creatorId));
        }
      }
      if (data.action === "request") {
        if (data.game.creatorId === auth.userId) {
          dispatch(roomActions.changeMyRoom(data.game));
        } else if (data.game.participantId !== auth.userId) {
          dispatch(roomActions.changeOtherRooms(data.game));
        }
      }
      if (data.action === "respond") {
        if (data.game.creatorId !== auth.userId) {
          if (data.accept && data.game.participantId === auth.userId)
            dispatch(roomActions.moveFromOtherRoomsToMyRoom(data.game));
          else if (!data.accept && data.priorParticipantId === auth.userId)
            dispatch(roomActions.changeToDecline(data.game));
          else dispatch(roomActions.changeOtherRooms(data.game));
        }
      }
      if (data.action === "leave") {
        if (
          data.priorParticipantId !== auth.userId &&
          data.game.creatorId !== auth.userId
        ) {
          dispatch(roomActions.changeOtherRooms(data.game));
        }
      }
      if (data.action === "close") {
        if (data.game.creatorId !== auth.userId) {
          if (data.game.participantId !== auth.userId) {
            dispatch(roomActions.deleteOtherRooms(data.game.creatorId));
          }
        }
      }
    },
    [auth.userId, dispatch]
  );

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const responseData = await sendRequest(
          BASE_URL + "/api/games",
          "GET",
          null,
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        );
        // console.log(responseData);
        dispatch(roomActions.setMyRoom(responseData.myGame));
        dispatch(roomActions.setOtherRooms(responseData.otherGames));
      } catch (err) {
        console.log(err);
      }
    };
    fetchGames();

    socket.auth = {
      token: auth.token,
    };

    // looks like once connected, it won't reconnect unless disconnected
    socket.connect();

    // debug
    // socket.onAny((event, ...args) => {
    //   console.log(event, args);
    // });

    socket.on("connect_error", (err) => {
      console.log(err.message);
    });

    socket.on("connect", () => {
      console.log("socket connected: " + socket.id + " " + socket.auth.uid);
    });

    socket.on("disconnect", () => {
      console.log("disconnected: " + socket.id + " " + socket.auth.uid);
    });

    socket.on("room", (data) => {
      // console.log("room emit");
      socketEventHandler(data);
    });

    return () => {
      socket.off("connect_error");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room");
      socket.disconnect();
      // console.log("Unmount Lobby");
    };
  }, [sendRequest, auth.token, dispatch, socketEventHandler]);

  return (
    <div className={styles["lobby-container"]}>
      {myGame?.started && (
        <NavLink to="/game" className={styles["lobby__link"]}>
          <Button inverse>
            <h2>Go to My Game</h2>
          </Button>
        </NavLink>
      )}
      {!myGame && <NewGame />}
      {isLoading && <Spinner />}
      {myGame && !myGame.started && <ManageGame />}
      {!myGame?.started && otherGames && <JoinGame />}
      {error && <Error message={error} onClick={() => clearError()} />}
    </div>
  );
};

export default Lobby;
