import { configureStore } from "@reduxjs/toolkit";
import gameSlice from "./game-slice";
import roomSlice from "./room-slice";

const store = configureStore({
  reducer: { game: gameSlice.reducer, room: roomSlice.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const gameActions = gameSlice.actions;
export const roomActions = roomSlice.actions;

export default store;
