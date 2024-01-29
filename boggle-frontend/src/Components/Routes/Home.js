
import { useState, useEffect } from 'react';
import io from 'socket.io-client'
//Import in all react components
import Chat from '../Chat';

//Initializing socket connection, will have to move eventually
const nodeserverURL = 'http://localhost:5000';
const socket = io.connect(nodeserverURL);



export default function Home() {
    const [username, setuserName] = useState("");
    const [room, setRoom] = useState("");

    const handleJoinRoom = () => {
        if (username!=="" && room!==""){
            socket.emit("joinRoom", room);
        }
    }
    return (
      <main>
        <h1>HOME</h1>
        <input type="text" placeholder='name' onChange={(e) => setuserName(e.target.value)}></input>
          <input type="text" placeholder='roomId' onChange={(e) => setRoom(e.target.value)}></input>
          <button onClick={handleJoinRoom}> Join a room </button>
        <Chat socket={socket} username={username} room={room} />
      </main>
    );
  };