import {
  KingBlack,
  KingWhite,
  KnightBlack,
  KnightWhite,
  PawnBlack,
  PawnWhite,
  QueenBlack,
  QueenWhite,
  RookBlack,
  RookWhite,
  BishopWhite,
  BishopBlack,
} from "../components/icons";

export const isShaded = (x) => {
  const row = Math.floor(x / 8);
  const col = x % 8;
  return row % 2 === 0 ? col % 2 === 1 : col % 2 === 0;
};

export const getPieceSVG = (value, color) => {
  let first = value.charAt(0);
  let second = value.charAt(1);
  if (first === "X") return null;
  if (first === "R") {
    if (
      (color === "White" && second === "1") ||
      (color === "Black" && second === "2")
    ) {
      return <RookWhite />;
    }
    return <RookBlack />;
  }
  if (first === "H") {
    if (
      (color === "White" && second === "1") ||
      (color === "Black" && second === "2")
    ) {
      return <KnightWhite />;
    }
    return <KnightBlack />;
  }
  if (first === "K") {
    if (
      (color === "White" && second === "1") ||
      (color === "Black" && second === "2")
    ) {
      return <KingWhite />;
    }
    return <KingBlack />;
  }
  if (first === "Q") {
    if (
      (color === "White" && second === "1") ||
      (color === "Black" && second === "2")
    ) {
      return <QueenWhite />;
    }
    return <QueenBlack />;
  }
  if (first === "P") {
    if (
      (color === "White" && second === "1") ||
      (color === "Black" && second === "2")
    ) {
      return <PawnWhite />;
    }
    return <PawnBlack />;
  }
  if (first === "B") {
    if (
      (color === "White" && second === "1") ||
      (color === "Black" && second === "2")
    ) {
      return <BishopWhite />;
    }
    return <BishopBlack />;
  }
};
