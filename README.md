# Chess App frontend

This React app is a frontend for the fullstack MERN app whose backend can be found at:
https://github.com/JayLeeJaeYoung/chess-app-backend

The app is hosted live at: http://JayLeeJaeYoung.github.io/chess-app-frontend
Please contact the admin for access password

## Description

The app requires an access password to log in (provided by admin).

![image](https://user-images.githubusercontent.com/28867941/145312969-87131d79-8d85-40a3-827b-a010a53abc08.png)

Once logged in, users can either create their own room or join an existing room.

![image](https://user-images.githubusercontent.com/28867941/145313255-6d74b854-3cab-4cc6-adc4-49188d4e2e44.png)
![image](https://user-images.githubusercontent.com/28867941/145313304-5d546796-f19f-480e-b180-52084496f6ac.png)
![image](https://user-images.githubusercontent.com/28867941/145313326-e512ce82-4e4f-4244-a6e4-bcf09861ddb2.png)

If the user creates a room, he/she waits until a participant requests to join the room at which point the creator has an option to either accept or decline the request.

![image](https://user-images.githubusercontent.com/28867941/145313389-f07a9bcf-8c2c-4e48-b00a-5c12a8b1ea75.png)

If the user wants to join an existing as a participant, the user can request to join the room, then waits until the creator lets the user in.

![image](https://user-images.githubusercontent.com/28867941/145313428-fe13f706-714f-4320-b6fc-41273b12d2eb.png)

Once the players are "matched", the app lets the creator to choose either the "white" or the "black" chess pieces for creator, then the chess game starts with the chess board as well as a dashboard.

![image](https://user-images.githubusercontent.com/28867941/145313562-2fc02794-ad7d-45f2-863d-0d109a173027.png)

At any point, the players can cancel the game. All the standard chess rules apply per chess.com, including en passant and castle. Whenever a player is "checked", the app notisfies the status on the dashboard. The players are not allowed to move pieces to put himself/herself to be checked. 

![image](https://user-images.githubusercontent.com/28867941/145313713-ba11405b-200c-437a-97b0-18f919a58c62.png)

The game either ends by a checkmate or a stalemate. At each game's termination, the players can choose to restart the game or leave the room.

![image](https://user-images.githubusercontent.com/28867941/145313821-7bba5cbf-63bf-453c-aac8-a3bf484de212.png)


## Design

Built on MERN stack.
react-router-dom to manage SPA, context to manage authentication, redux slice to manage game information, socket-io to handle "emit" events from the backend.

Please refer to https://github.com/JayLeeJaeYoung/chess-app-backend for backend design.

Token is set to expire after 3 hours.

![image](https://user-images.githubusercontent.com/28867941/145314032-465e24a5-114b-4b46-80fb-d394709c634d.png)

![image](https://user-images.githubusercontent.com/28867941/145314108-f99cac63-9db9-47f1-85fe-a8d456c890b2.png)


