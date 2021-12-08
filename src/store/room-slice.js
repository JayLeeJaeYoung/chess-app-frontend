import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
  name: "room",
  // myRoom is {} and otherRooms is [{}, {}]
  initialState: { myRoom: undefined, otherRooms: [] },
  reducers: {
    setMyRoom(state, action) {
      state.myRoom = action.payload;
    },
    changeMyRoom(state, action) {
      const newObj = action.payload;
      state.myRoom = { ...state.myRoom, ...newObj };
    },
    moveFromMyRoomToOtherRooms(state, action) {
      state.myRoom = null;
      state.otherRooms = [...state.otherRooms, action.payload];
    },
    moveFromOtherRoomsToMyRoom(state, action) {
      const newObj = action.payload;

      const myRoomTemp = state.otherRooms.filter(
        (game) => game.creatorId === newObj.creatorId
      )[0];

      state.myRoom = { myRoomTemp, ...newObj };

      state.otherRooms = state.otherRooms.filter(
        (game) => game.creatorId !== newObj.creatorId
      );
    },

    setOtherRooms(state, action) {
      state.otherRooms = action.payload;
    },
    changeToDecline(state, action) {
      const newObj = action.payload;
      newObj["declined"] = true;
      const index = state.otherRooms.findIndex(
        (game) => game.creatorId === newObj.creatorId
      );
      if (index !== -1) {
        state.otherRooms[index] = { ...state.otherRooms[index], ...newObj };
      }
    },
    fromDeclineToInitial(state, action) {
      const rid = action.payload;
      const index = state.otherRooms.findIndex((game) => game._id === rid);
      if (index !== -1) {
        state.otherRooms[index]["declined"] = false;
      }
    },
    changeOtherRooms(state, action) {
      const newObj = action.payload;
      const index = state.otherRooms.findIndex(
        (game) => game.creatorId === newObj.creatorId
      );
      if (index !== -1) {
        state.otherRooms[index] = { ...state.otherRooms[index], ...newObj };
      }
    },

    addOtherRooms(state, action) {
      state.otherRooms = [...state.otherRooms, action.payload];
    },
    deleteOtherRooms(state, action) {
      state.otherRooms = state.otherRooms.filter(
        (game) => game.creatorId !== action.payload
      );
    },
  },
});

export default roomSlice;
