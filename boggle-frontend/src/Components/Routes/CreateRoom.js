
//Import in all hooks and dependencies
import { useState, useEffect, useContext, useRef } from 'react';
import { CurrentUser }                     from "../../Contexts/CurrentUser"
import io from 'socket.io-client'
//Import in all react components
import Chat from '../Chat';
//import in all bootstrap components
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

//Initializing socket connection, will have to move eventually
const nodeserverURL = 'http://localhost:5000';



//Note this isnt actually home, all will be moved to create a multiplayer lobby eventually 


export default function CreateRoom() {
    let { currentUser } = useContext(CurrentUser);
    let [socket, setSocket] = useState(null);
    let [createRoomInputs, setCreateRoomInputs] = useState({
      username : '',
      roomId : '',
      maxSize: 3,
      isPrivate : false,
      isCreator: true
    }) 
    //only added if you successfully connect
    let [room, setRoom] = useState(null);
    let [roomParticipants, setRoomParticipants] = useState(null);

    // Makes the initial socket connection
    //Making the use effects run in the correct order
    let [isContextandSocket, setisContextandSocket] = useState(false)
    useEffect(() => {
      if (currentUser){
        const socketInstance = io(nodeserverURL);
        setSocket(socketInstance);
        console.log('You are connected to your socket');
        //adding as well username to the socket submitted obj
        setCreateRoomInputs({ ...createRoomInputs, username: currentUser.username })
        setisContextandSocket(true);
      }
    }, [currentUser]);
    //listens for all socket changes
    useEffect(() => {
      console.log('here')
      if (isContextandSocket){
        console.log('socket update')
        socket.on("recieveRoomCount", (roomData) => {
          console.log(roomData);
        });
        return () => {}
      }
    }, [socket])


    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (currentUser && socket){
            socket.emit("joinRoom", createRoomInputs);
            //on success give a toast notif
            //setRoom(createRoomInputs.roomId);
            //once this happens change the form into a counter of how many people are present
        }else{
          //give some meaningful error toast
        }
    };

    let displayRoomForm = (<h2>Please Login Prior to trying trying to create a room </h2>)
    if (currentUser){
      displayRoomForm = (
          <Form data-bs-theme="dark" className=" p-5 mb-2 bg-dark bg-gradient text-white form">
          <h1>Create a Boggle Party Lobby</h1>
          {/* Will need : max number of players, friends only, game type (big or little), letters used, enable custom words,  */}
          <h2  className="mb-3"> Room Settings</h2>
          <Form.Group className="mb-3">
                    <Form.Label>username</Form.Label>
                    <Form.Control 
                        type="text"
                        disabled
                        value={currentUser.username}
                        required
                    />
          </Form.Group>
          <Form.Group className="mb-3">
                    <Form.Label>Room Id</Form.Label>
                    <Form.Control 
                        type="text"
                        value = {createRoomInputs.roomId}
                        onChange={e => setCreateRoomInputs({ ...createRoomInputs, roomId: e.target.value })}
                        placeholder='roomId'
                        required
                    />
          </Form.Group>
          <Form.Group className="mb-3">
                    <Form.Label>Maximum Number of Participants</Form.Label>
                    <Form.Control 
                        type="number"
                        min={2}
                        max={6}
                        value={createRoomInputs.maxSize}
                        onChange={e => setCreateRoomInputs({ ...createRoomInputs, maxSize: e.target.value })}
                        required
                    />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check 
                type="checkbox" 
                label="Make Room Private" 
                value={createRoomInputs.isPrivate}
                onChange={e => setCreateRoomInputs({ ...createRoomInputs, isPrivate: e.target.value })}
                required
              />
          </Form.Group>
          <h2  className="mb-3" >Game Settings</h2>
          <Button variant="outline-light" size="lg" type="submit" className="mb-5" onClick={handleCreateRoom}>
              Create a Room      
          </Button>
        </Form>
      )
    };
    //Once we have a room id we open up a chatting option with whomever else is present and waiting
    const displayChat = room && <Chat socket={socket} room={room} />

    return (
      <main>
        {displayRoomForm}

        {displayChat}
      </main>
    );
  };