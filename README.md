# Chess App frontend

This React app is a frontend for the fullstack MERN app whose backend can be found at:
https://github.com/JayLeeJaeYoung/chess-app-backend

The app is hosted live at: http://JayLeeJaeYoung.github.io/chess-app-frontend
Please contact the admin for access password

## Description

The app requires an access password to log in (provided by admin).
Once logged in, users can either create their own room or join an existing room.
If the user creates a room, he/she waits until a participant requests to join the room at which point the creator has an option to either accept or decline the request.
If the user wants to join an existing as a participant, the user can request to join the room, then waits until the creator lets the user in.

Once the players are "matched", the app lets the creator to choose either the "white" or the "black" chess pieces for creator, then the chess game starts with the chess board as well as a dashboard.

At any point, the players can cancel the game. All the standard chess rules apply per chess.com, including en passant and castle. Whenever a player is "checked", the app notisfies the status on the dashboard. The players are not allowed to move pieces to put himself/herself to be checked. The game either ends by a checkmate or a stalemate. At each game's termination, the players can choose to restart the game or leave the room.

## Design

Built on MERN stack.
react-router-dom to manage SPA, context to manage authentication, redux slice to manage game information, socket-io to handle "emit" events from the backend.
