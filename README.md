# Boggle

This repo contains frontend and backend for a multiplayer, online boggle application built with Node.js, express, socket.io, postgre, and React.js. It is designed to allow users to create private, flexible multiplayer lobbies and analyze their previous game statistics.

The main educational goal was to explore integrating sockets and express with jwt middleware, and explore the algorithms behind efficently solving a game. 

The current, MVP is available at the following link: https://boggle-frontend.vercel.app/
 

## Features

- **Lobby Generation:**  Create multiplayer lobbies that can be:
    1. Publically available or friends only
    2. Custom lobby sizes
    3. Custom game durations
    4. Multiple board size and dice selections
    5. Toggleable autocheck prior to player submission
    6. Creator ability to kick any user within the lobby
- **Game Tracking:**
    1. Coming soon...
- **Social Media**
    1. Coming soon...

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software:

- Node.js
- npm (Node Package Manager)
- PostgreSQL

### Installing

A step-by-step series of examples that tell you how to get a development environment running:

1. **Clone the repository:**
  
  ```bash
  git clone https://github.com/akullyot/boggleMonorepo.git
  ```

2. **Navigate to the boggle-backend directory:**

  ```bash
  cd boggle-backend
  ```
3. **Install dependencies:**

  ```bash
  npm install
  npx sequelize::migrate
  ```
4. **reate a postgre database locally and migrate the table structure:**

  ```bash
  npx sequelize::migrate
  ```
5. **Set up environment variables:**

Create a .env file in the backend directory and add the necessary configurations (refer to .env.example for a template).

6. **Start the server:**

  ```bash

  npm start
  ```

The server will start running on the port designated by the .env.

7. **Navigate to the boggle-frontend directory**
   
 ```bash
  npm install
  ```

8. ** And run the front end **

```bash
  npm start
```


## Issues and Improvements

- Upon leaving a lobby by manually closing the website as a user, the socket does not update and remove the user from the lobby. The fix requires an action on window unload from the react frontend.
- Inputting a newly created room lobby key URL sometimes does not allow users to join the room if they just logged in. A useEffect tracking the state of the context of the user credentials is required in the react frontend
-  The socket server reciever functions should be moved into their own file for readability. 










