// convert the board into the opponent's board
// coordinate transformation
const convertToOpponent = (boardInput) => {
  const board = [...boardInput];
  const opponentBoard = new Array(64).fill("X0");
  let piece;
  let newPiece;

  for (let i = 0; i < 64; i++) {
    piece = board[i];
    if (piece.charAt(1) === "1") newPiece = piece.charAt(0) + "2";
    else if (piece.charAt(1) === "2") newPiece = piece.charAt(0) + "1";
    else continue;
    opponentBoard[63 - i] = newPiece;
  }
  return opponentBoard.slice();
};

// i, j represent delta move in x and y direction in 2D coordinate
// returning the 1D coordinate of such displacement
// if out of bound, return -1
const getIndex = (index, i, j) => {
  const rowIndex = Math.floor(index / 8);
  const colIndex = index % 8;
  if (rowIndex + i < 0 || rowIndex + i > 7) return -1;
  if (colIndex + j < 0 || colIndex + j > 7) return -1;
  return (rowIndex + i) * 8 + (colIndex + j);
};

// ignores en passant capture
// en passant capture is not relelvant to evaluating "check" which only concerns the king
const pawnMoves = (x, board, move, capture) => {
  let y = getIndex(x, -1, -1);
  if (y !== -1 && board[y].charAt(1) === "2") capture[y] = true;
  y = getIndex(x, -1, 1);
  if (y !== -1 && board[y].charAt(1) === "2") capture[y] = true;

  y = getIndex(x, -1, 0);
  if (board[y].charAt(1) === "0") {
    move[y] = true;
    // en passant move (not en passant capture)
    if (Math.floor(x / 8) === 6) {
      y = getIndex(x, -2, 0);
      if (board[y].charAt(1) === "0") move[y] = true;
    }
  }
};

const rookMoves = (x, board, move, capture) => {
  let y;
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, delta, 0);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, -delta, 0);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") {
      move[y] = true;
    } else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, 0, delta);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, 0, -delta);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
};

const knightMoves = (x, board, move, capture) => {
  const deltaList = [
    [-2, -1],
    [-2, 1],
    [-1, 2],
    [-1, -2],
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
  ];
  let y;
  for (const delta of deltaList) {
    y = getIndex(x, delta[0], delta[1]);
    if (y === -1) continue;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") capture[y] = true;
  }
};

const bishopMoves = (x, board, move, capture) => {
  let y;
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, delta, delta);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, -delta, delta);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, delta, -delta);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
  for (let delta = 1; delta < 8; delta++) {
    y = getIndex(x, -delta, -delta);
    if (y === -1) break;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") {
      capture[y] = true;
      break;
    } else break;
  }
};

const kingMoves = (x, board, move, capture) => {
  let y;
  const deltaList = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  for (const delta of deltaList) {
    y = getIndex(x, delta[0], delta[1]);
    if (y === -1) continue;
    if (board[y].charAt(1) === "0") move[y] = true;
    else if (board[y].charAt(1) === "2") capture[y] = true;
  }
};

// update move and capture based on the index clicked
// find all available move and capture positions for the piece clicked
// ignores en passant capture but includes en passant move
const pieceMoves = (x, board, move, capture) => {
  if (board[x] === "P1") {
    pawnMoves(x, board, move, capture);
  } else if (board[x] === "R1") {
    rookMoves(x, board, move, capture);
  } else if (board[x] === "H1") {
    knightMoves(x, board, move, capture);
  } else if (board[x] === "B1") {
    bishopMoves(x, board, move, capture);
  } else if (board[x] === "Q1") {
    rookMoves(x, board, move, capture);
    bishopMoves(x, board, move, capture);
  } else if (board[x] === "K1") {
    kingMoves(x, board, move, capture);
  }
};

const changeToReady = (x, board, enPassant, castleLeft, castleRight) => {
  // assumes x represents the index of my piece clicked (no opponent's piece nor empty cell)
  const move = {};
  const capture = {};

  pieceMoves(x, board, move, capture);
  // manually add en passant capture
  if (board[x] === "P1" && enPassant !== -1) {
    let y = getIndex(enPassant, 1, 1);
    if (x === y) capture[enPassant] = true;
    y = getIndex(enPassant, 1, -1);
    if (x === y) capture[enPassant] = true;
  }

  // move is available positions to move into
  // capture is available positions to capture into
  // of these move/capture, subtract any position that would cause the player to be checked

  // we need the opponent's board to figure out whether I am checked
  const board2 = convertToOpponent(board); // board from opponent's perspective
  for (let key in move) {
    // x is current position and y is the new position if I make the move in my board's coordinate
    let y = Number(key);

    // Make my move and record it in the enemy's board
    board2[63 - y] = board2[63 - x];
    board2[63 - x] = "X0";

    let kingIndex; // index of my king in the coordinate of enemy's board
    let enemyMove = {}; // available moves enemy can make in enemey's board
    let enemyCapture = {}; // available captures enemy can make in enemy's board
    for (let i = 0; i < 64; i++) {
      if (board2[i] === "K2") {
        kingIndex = i;
      }
      pieceMoves(i, board2, enemyMove, enemyCapture);
    }

    // if my king is in the available capture moves by the enemy, this would cause me to be
    // checked, so remove this potential move by me from the move object
    if (kingIndex in enemyCapture) {
      delete move[key]; // per stackoverflow, deleting the elemnet while iterating is OK
    }

    // Undo my move and record it in the enemy's board
    board2[63 - x] = board2[63 - y];
    board2[63 - y] = "X0";
  }

  for (let key in capture) {
    // x is current position and y is the new position if I make the capture in my board's coordinate
    let y = Number(key);

    // Make the capture and record it in the enemy's board
    let capturedPiece = board2[63 - y];
    board2[63 - y] = board2[63 - x];
    board2[63 - x] = "X0";
    if (board[x] === "P1" && y === enPassant) {
      // en Passant capture
      board2[63 - (y + 8)] = "X0";
    }

    let kingIndex; // index of my king in the coordinate of enemy's board
    let enemyMove = {}; // available moves enemy can make in enemey's board
    let enemyCapture = {}; // available captures enemy can make in enemy's board
    for (let i = 0; i < 64; i++) {
      if (board2[i] === "K2") {
        kingIndex = i;
      }
      pieceMoves(i, board2, enemyMove, enemyCapture);
    }

    // if my king is in the available capture moves by the enemy, this would cause me to be
    // checked, so remove this potential capture by me from the capture object
    if (kingIndex in enemyCapture) {
      delete capture[key]; // per stackoverflow, deleting the elemnet while iterating is OK
    }

    // Undo my capture and record it in the enemy's board
    board2[63 - x] = board2[63 - y];
    board2[63 - y] = capturedPiece;
    if (board[x] === "P1" && y === enPassant) {
      // en Passant capture
      board2[63 - (y + 8)] = "P2";
    }
  }

  // if castle if possible, add to move
  // no need to verify not being check as this is done in backend
  if (board[x] === "K1") {
    let kingIndex = board[59] === "K1" ? 59 : 60;
    if (castleLeft) {
      move[kingIndex - 2] = true;
    }
    if (castleRight) {
      move[kingIndex + 2] = true;
    }
  }

  return {
    mode: "ready",
    piece: x,
    capture,
    move,
  };
};

export default changeToReady;
