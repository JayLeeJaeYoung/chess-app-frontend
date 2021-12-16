import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Button from "../components/Button";
import Error from "../components/Error";
import Card from "../components/Card";
import RadioInput from "../components/RadioInput";
import { Spinner } from "../components/icons";

import { AuthContext } from "../util/auth-context";
import useHttpClient from "../util/http-hook";
import { BASE_URL } from "../util/config";
import socket from "../util/socket-client";
import { isShaded, getPieceSVG } from "../util/game-helper";
import { gameActions, roomActions } from "../store";

import styles from "./Game.module.css";

const Cell = (props) => {
  const { id, value, color, selected, move, capture, myTurn, winner } = props;

  const shaded = isShaded(id);
  const pieceSVG = getPieceSVG(value, color);

  const dispatch = useDispatch();

  const onClickHandler = (event) => {
    // console.log("click: " + id);
    if (myTurn && winner === "") {
      dispatch(gameActions.changeStatus(id));
    }
  };
  return (
    <div
      className={`${styles.cell} ${shaded && styles.odd}
       ${selected && styles.selected}  ${move && styles.move}
       ${capture && styles.capture}`}
      onClick={onClickHandler}>
      {pieceSVG}
    </div>
  );
};

const GameBoard = (props) => {
  const { opponentLeft } = props;

  const indices = useMemo(() => [...Array(64).keys()], []);

  const history = useHistory();

  const dispatch = useDispatch();
  const info = useSelector((state) => state.game.info);
  const myGame = useSelector((state) => state.game.myGame);
  const grid = myGame.history[myGame.step].board;
  const check = myGame.history[myGame.step].check;
  const winner = myGame.history[myGame.step].winner;

  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [pawnPromotionPiece, setPawnPromotionPiece] = useState("");

  const submitHandler = async () => {
    try {
      const responseData = await sendRequest(
        BASE_URL + "/api/games/game/round",
        "PATCH",
        JSON.stringify({
          round: myGame.history[myGame.step],
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      // console.log("round submitted");
      // console.log(responseData);
      dispatch(gameActions.syncWithServer(responseData.game));
    } catch (err) {
      console.log(err);
    }
  };

  const cancelHandler = () => {
    dispatch(gameActions.goback());
  };

  const pawnPromotionSubmitHandler = (event) => {
    event.preventDefault();
    dispatch(gameActions.promotePawn(pawnPromotionPiece));
  };

  const pawmPromotionRadio = (event) => {
    setPawnPromotionPiece(event.target.value);
    // console.log("pawn promotion: " + event.target.value);
  };

  const leaveAccept = () => {
    history.push("/lobby");
  };

  const creatorLeaveHandler = async () => {
    try {
      await sendRequest(BASE_URL + "/api/games/game/close", "DELETE", null, {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      });
      // console.log("Creator closed the room");
      // console.log(responseData);
      dispatch(roomActions.setMyRoom(undefined));
      history.push("/lobby");
    } catch (err) {
      console.log(err);
    }
  };

  const creatorStartOver = async () => {
    try {
      await sendRequest(BASE_URL + "/api/games/game/renew", "PATCH", null, {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      });
      // console.log("Creator started over the game");
      // console.log(responseData);
      dispatch(gameActions.startover());
      history.push("/game");
    } catch (err) {
      console.log(err);
    }
  };

  const participantLeaveHandler = async () => {
    try {
      const responseData = await sendRequest(
        BASE_URL + "/api/games/game/leave",
        "PATCH",
        null,
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      // console.log("partiicpant left");
      // console.log(responseData);
      dispatch(roomActions.moveFromMyRoomToOtherRooms(responseData.game));
      history.push("/lobby");
    } catch (err) {
      console.log(err);
    }
  };

  let gameOverString = "Stalemate";
  if (winner === "White") gameOverString = "White won!";
  if (winner === "Black") gameOverString = "Black won!";

  return (
    <div className={styles["game-board-container"]}>
      <div className={styles["game-board__grid"]}>
        {winner !== "" && (
          <Card styles="gameover">Game Over: {gameOverString}</Card>
        )}
        {winner !== "" && auth.userId === info.creatorId && !opponentLeft && (
          <div>
            <div className={styles["gameover_wait"]}>
              You can close the game or start over
            </div>
            <Spinner />
            <div className={styles["gameover_action"]}>
              <Button onClick={creatorLeaveHandler}>Close Game</Button>
              <Button onClick={creatorStartOver}>Start Over</Button>
            </div>
          </div>
        )}
        {winner !== "" && auth.userId === info.creatorId && opponentLeft && (
          <div className={styles["game-board__sidebar__leave"]}>
            <div className={styles["game-board__sidebar__leave1"]}>
              Participant left the game
            </div>
            <Button danger onClick={leaveAccept}>
              OK
            </Button>
          </div>
        )}
        {winner !== "" && auth.userId !== info.creatorId && (
          <div className={styles["gameover_wait"]}>
            <div>Waiting for room creator to start over...</div>
            <Spinner />
            <div>Or you can choose to exit the room</div>
            <Button danger onClick={participantLeaveHandler}>
              Leave Game
            </Button>
          </div>
        )}
        {myGame.status.mode === "pawn_promotion" && (
          <Card>
            <form
              onSubmit={pawnPromotionSubmitHandler}
              className={styles["pawn-promotion"]}>
              <RadioInput
                name="pawn"
                prompt="Please choose the piece for pawn promotion"
                values={[1, 2, 3, 4]}
                labels={["Queen", "Knight", "Rook", "Bishop"]}
                isTouched={pawnPromotionPiece !== ""}
                value={pawnPromotionPiece}
                onInput={pawmPromotionRadio}
                errorText="Please select your new piece"
              />
              <div className={styles["pawn-promotion-div"]}>
                <Button type="submit" disabled={!pawnPromotionPiece}>
                  Submit
                </Button>
              </div>
            </form>
          </Card>
        )}
        <div className={styles["game-board"]}>
          {indices.map((i) => (
            <Cell
              key={i}
              id={i}
              value={grid[i]}
              color={info.color}
              selected={myGame.status.piece === i}
              move={myGame.status.move[i]}
              capture={myGame.status.capture[i]}
              myTurn={myGame.myTurn}
              winner={winner}
            />
          ))}
        </div>
        {winner === "" && (
          <div className={styles["round__button"]}>
            <Button
              big
              styles="round-submit"
              onClick={submitHandler}
              disabled={
                !myGame.myTurn ||
                myGame.status.mode !== "disabled" ||
                winner !== ""
              }>
              Submit
            </Button>
            <Button
              big
              styles="round-submit"
              onClick={cancelHandler}
              danger
              disabled={
                !myGame.myTurn ||
                myGame.status.mode !== "disabled" ||
                winner !== ""
              }>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className={styles["game-board__sidebar"]}>
        <div className={styles["game-board__sidebar__info"]}>
          <div className={styles["game-board__sidebar__info__roomname"]}>
            {info.roomname}
          </div>
          <div className={styles["game-board__sidebar__info__players"]}>
            {`Player ${info.color === "White" ? "White" : "Black"}`}
          </div>
          <div className={styles["game-board__sidebar__info__players2"]}>
            {`${info.myName} (Me)`}
          </div>
          <div className={styles["game-board__sidebar__info__players"]}>
            {`Player ${info.color === "White" ? "Black" : "White"} `}
          </div>
          <div className={styles["game-board__sidebar__info__players2"]}>
            {`${info.opponentName}`}
          </div>
        </div>
        <Card styles="sidebar-dashboard">
          <div className={styles["dashboard-round"]}>Round: {myGame.round}</div>
          {winner === "" && myGame.myTurn && (
            <div className={styles["dashboard-my-turn"]}>It's my turn!</div>
          )}
          {winner === "" && !myGame.myTurn && (
            <div className={styles["dashboard-their-turn"]}>Waiting ...</div>
          )}
          {winner !== "" && (
            <div className={styles["dashboard-gameover"]}>{gameOverString}</div>
          )}
          {check && <div className={styles["dashboard-check"]}>Check</div>}
          {!check && <div className={styles["dashboard-not-check"]}>Check</div>}
        </Card>
        {error && <Error message={error} onClick={() => clearError()} />}
        {isLoading && <Spinner />}
        {!opponentLeft && info.creatorId === auth.userId && (
          <div className={styles["game-board__sidebar__leave"]}>
            <Button inverse onClick={creatorLeaveHandler}>
              Close Game
            </Button>
          </div>
        )}
        {!opponentLeft && info.creatorId !== auth.userId && (
          <div className={styles["game-board__sidebar__leave"]}>
            <Button inverse onClick={participantLeaveHandler}>
              Leave Game
            </Button>
          </div>
        )}
        {opponentLeft && info.creatorId === auth.userId && (
          <div className={styles["game-board__sidebar__leave"]}>
            <div className={styles["game-board__sidebar__leave1"]}>
              Participant left the game
            </div>
            <Button danger onClick={leaveAccept}>
              OK
            </Button>
          </div>
        )}
        {opponentLeft && info.creatorId !== auth.userId && (
          <div className={styles["game-board__sidebar__leave"]}>
            <div className={styles["game-board__sidebar__leave1"]}>
              Creator closed the room
            </div>
            <Button danger onClick={leaveAccept}>
              OK
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const PreGameCreator = (props) => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [userColor, setUserColor] = useState("");
  const dispatch = useDispatch();

  const colorSubmitHandler = async (event) => {
    event.preventDefault();
    clearError();
    try {
      const responseData = await sendRequest(
        BASE_URL + "/api/games/game/color",
        "PATCH",
        JSON.stringify({
          color: userColor,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      // console.log("color chosen");
      // console.log(responseData);
      dispatch(gameActions.initialize(responseData.game));
    } catch (err) {
      console.log(err);
    }
  };

  const radioInputHandlder = (event) => {
    setUserColor(event.target.value);
    // console.log("color: " + event.target.value);
  };

  return (
    <div className={styles["preGameCreator-container"]}>
      <form onSubmit={colorSubmitHandler}>
        <RadioInput
          name="color"
          prompt="Please select your color"
          values={[1, 2]}
          labels={["White", "Black"]}
          isTouched={userColor !== ""}
          value={userColor}
          onInput={radioInputHandlder}
          errorText="Please select your color"
        />
        <div>
          <Button type="submit" disabled={!userColor}>
            Submit
          </Button>
        </div>
        {error && <Error message={error} onClick={() => clearError()} />}
        {isLoading && <Spinner />}
      </form>
    </div>
  );
};

const PreGameParticipant = (props) => {
  return (
    <div className={styles["preGameCreator-container"]}>
      <h4>Waiting for creator to assign white or black</h4>
      <Spinner />
    </div>
  );
};

const Game = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory();
  const dispatch = useDispatch();
  const info = useSelector((state) => state.game.info);
  // const myGame = useSelector((state) => state.game.myGame);
  // const myRoom = useSelector((state) => state.room.myRoom);
  const [opponentLeft, setOpponentLeft] = useState(false);

  const socketGameEventHandler = useCallback(
    (data) => {
      if (data.action === "initialize") {
        dispatch(gameActions.initialize(data.game));
      }
      if (data.action === "round") {
        dispatch(gameActions.syncWithServer(data.game));
      }
      if (data.action === "renew") {
        dispatch(gameActions.startover());
        history.push("/lobby");
      }
    },
    [dispatch, history]
  );

  const socketRoomEventHandler = useCallback(
    (data) => {
      if (data.action === "leave") {
        if (data.priorParticipantId !== auth.userId) {
          if (data.game.creatorId === auth.userId) {
            dispatch(roomActions.changeMyRoom(data.game));
            setOpponentLeft(true);
          }
        }
      }
      if (data.action === "close") {
        if (data.game.creatorId !== auth.userId) {
          if (data.game.participantId === auth.userId) {
            dispatch(roomActions.setMyRoom(undefined));
            setOpponentLeft(true);
          }
        }
      }
    },
    [dispatch, auth.userId]
  );

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const responseData = await sendRequest(
          BASE_URL + "/api/games/game",
          "GET",
          null,
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        );
        // console.log(responseData);
        dispatch(gameActions.initialize(responseData.game));
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

    socket.on("game", (data) => {
      // console.log("game emit");
      // console.log(data);
      socketGameEventHandler(data);
    });

    socket.on("room", (data) => {
      // console.log("room emit");
      socketRoomEventHandler(data);
    });

    return () => {
      socket.off("connect_error");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("game");
      socket.disconnect();
      // console.log("Unmount Game");
    };
  }, [
    sendRequest,
    auth.token,
    dispatch,
    socketGameEventHandler,
    socketRoomEventHandler,
  ]);

  return (
    <div className={styles["game-container"]}>
      {!isLoading && info.color && <GameBoard opponentLeft={opponentLeft} />}
      {isLoading && <Spinner />}
      <Card styles="select-color">
        {!isLoading &&
          info._id &&
          !info.color &&
          auth.userId === info.creatorId && <PreGameCreator />}
        {!isLoading &&
          info._id &&
          !info.color &&
          auth.userId !== info.creatorId && <PreGameParticipant />}
        {error && info._id && (
          <Error message={error} onClick={() => clearError()} />
        )}
      </Card>
    </div>
  );
};

export default Game;
