import { createSlice } from "@reduxjs/toolkit";
import changeToReady from "./game-slice-helper";

const initialState = {
  info: {
    _id: null,
    roomname: null,
    creatorId: null,
    myName: null,
    opponentName: null,
    color: null,
  },
  myGame: {
    history: [
      {
        step: 0,
        board: new Array(64),
        check: false,
        winner: "",
      },
    ],
    round: 0, // round is this round number that does not change
    myTurn: true,
    step: 0, // step is the round number to display which can change when you go back and forth
    status: {
      mode: "standby", // "standby", "ready", "disabled"
      piece: -1,
      capture: {},
      move: {},
    },
  },
};

const gameSlice = createSlice({
  name: "game",
  initialState: initialState,
  reducers: {
    initialize(state, action) {
      const newObj = action.payload;
      let mode, myTurn;
      if (newObj.info.color === "White") {
        mode = newObj.myGame.step % 2 === 0 ? "standby" : "disabled";
        myTurn = newObj.myGame.step % 2 === 0 ? true : false;
      } else {
        mode = newObj.myGame.step % 2 === 1 ? "standby" : "disabled";
        myTurn = newObj.myGame.step % 2 === 1 ? true : false;
      }
      state.info = { ...state.info, ...newObj.info };
      state.myGame = { ...state.myGame, ...newObj.myGame };
      state.myGame.round = newObj.myGame.step;
      state.myGame.myTurn = myTurn;
      state.myGame.status = {
        mode,
        piece: -1,
        capture: {},
        move: {},
      };
    },
    startover(state, action) {
      state.info.color = null;
    },

    syncWithServer(state, action) {
      const myGame = action.payload;
      state.myGame.history = myGame.history;
      state.myGame.step = myGame.step;

      let mode, myTurn;
      if (state.info.color === "White") {
        mode = myGame.step % 2 === 0 ? "standby" : "disabled";
        myTurn = myGame.step % 2 === 0 ? true : false;
      } else {
        mode = myGame.step % 2 === 1 ? "standby" : "disabled";
        myTurn = myGame.step % 2 === 1 ? true : false;
      }

      state.myGame.round = myGame.step;
      state.myGame.myTurn = myTurn;

      state.myGame.status = {
        mode,
        piece: myGame.history[myGame.step].prevPiece,
        capture: {},
        move: {},
      };
    },

    // go back in step when you click "cancel", not go back in history for simple viewing
    // but this makes a permanent change to history
    goback(state, action) {
      state.myGame.step--;
      state.myGame.history.pop();
      state.myGame.status.mode = "standby";
      state.myGame.status.piece = -1;
    },

    promotePawn(state, action) {
      if (state.myGame.status.mode !== "pawn_promotion") return;
      // promotedPiece is either "B1", "R1" "H1" "Q1"
      let promotedPiece; // the new piece to be promoted to
      if (Number(action.payload) === 1) promotedPiece = "Q1";
      else if (Number(action.payload) === 2) promotedPiece = "H1";
      else if (Number(action.payload) === 3) promotedPiece = "R1";
      else promotedPiece = "B1";

      const board = state.myGame.history[state.myGame.step].board;
      board[state.myGame.status.piece] = promotedPiece;
      state.myGame.status.mode = "disabled";
    },

    changeStatus(state, action) {
      if (state.myGame.status.mode === "disabled") return;

      let x = action.payload; // x is the index clicked
      const board = state.myGame.history[state.myGame.step].board.slice();
      // enPassant is the index of the final en passant capture position
      // Note: this is not the en passant move, but the capture play after an en passant move
      // is made by the opponent
      const enPassant = state.myGame.history[state.myGame.step].enPassant;
      const castleLeft = state.myGame.history[state.myGame.step].castleLeft;
      const castleRight = state.myGame.history[state.myGame.step].castleRight;

      if (state.myGame.status.mode === "standby") {
        if (board[x].charAt(1) !== "1") return;
        state.myGame.status = changeToReady(
          x,
          board,
          enPassant,
          castleLeft,
          castleRight
        );
      }
      // "ready" mode
      else {
        if (board[x].charAt(1) === "1") {
          state.myGame.status = changeToReady(
            x,
            board,
            enPassant,
            castleLeft,
            castleRight
          );
        } else {
          if (state.myGame.status.move[x]) {
            board[x] = board[state.myGame.status.piece];
            board[state.myGame.status.piece] = "X0";

            // castle move
            if (board[x] === "K1") {
              if (state.myGame.status.piece - x === 2) {
                board[x + 1] = "R1";
                board[56] = "X0";
              } else if (state.myGame.status.piece - x === -2) {
                board[x - 1] = "R1";
                board[63] = "X0";
              }
            }

            const newRound = {
              step: state.myGame.step + 1,
              board: board,
              check: false,
              winner: "",
            };
            state.myGame.history.push(newRound);
            state.myGame.step++;

            if (board[x] === "P1" && Math.floor(x / 8) === 0) {
              state.myGame.status = {
                mode: "pawn_promotion",
                piece: x,
                capture: {},
                move: {},
              };
            } else {
              state.myGame.status = {
                mode: "disabled",
                piece: x,
                capture: {},
                move: {},
              };
            }
          } else if (state.myGame.status.capture[x]) {
            board[x] = board[state.myGame.status.piece];
            board[state.myGame.status.piece] = "X0";

            // en Passant capture
            if (board[x] === "P1" && x === enPassant) {
              board[x + 8] = "X0";
            }

            const newRound = {
              step: state.myGame.step + 1,
              board: board,
              check: false,
              winner: "",
            };
            state.myGame.history.push(newRound);
            state.myGame.step++;

            if (board[x] === "P1" && Math.floor(x / 8) === 0) {
              state.myGame.status = {
                mode: "pawn_promotion",
                piece: x,
                capture: {},
                move: {},
              };
            } else {
              state.myGame.status = {
                mode: "disabled",
                piece: x,
                capture: {},
                move: {},
              };
            }
          } else {
            state.myGame.status = {
              mode: "standby",
              piece: -1,
              capture: {},
              move: {},
            };
          }
        }
      }
    },
  },
});

export default gameSlice;
