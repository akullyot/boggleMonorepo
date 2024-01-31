
//Import in all hooks and dependencies
import { useState, useEffect, useContext, useRef } from 'react';
import { CurrentUser }                             from "../../Contexts/CurrentUser"
import { socket }                                  from  "../../Contexts/Socket"
//All required media
import logo from '../../Assets/Images/blocks.png'
//Import in all react components
import Chat from '../Multiplayer/Chat';
//import in all bootstrap components
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


export default function CreateRoom() {
    let { currentUser } = useContext(CurrentUser);
    let [createRoomInputs, setCreateRoomInputs] = useState({
      maxSize: 3,
      isPrivate : false,
      isCreator: true
    });
    //only added if you successfully connect and create a room
    let [roomId, setRoomId] = useState(null);
    let [formIsSubmitted, setFormIsSubmitted] = useState(false);
    let [roomInformation, setRoomInformation] = useState({
      roomCreator: 'You are the room creator',
      roomParticipants : [], //array of objs of the structure: username: username, userId: userid 
      isPrivate: 'Anyone logged in may join your room',
      roomSize: '' // 'There are x/y people present'
    });
    let [isRoomFull, setIsRoomFull] = useState(false);
    //toast notifications state variables
    let [showToast, setShowToast] = useState(false);
    let [toastType, setToastType] = useState('');
    let [toastMessage, setToastMessage] = useState('');





    //listens for all other socket changes
    useEffect(() => {
      //this emits out any time someone joins
      socket.on('recieveRoomCount', (roomInfo) => {
        setRoomInformation({ ...roomInformation, roomParticipants: roomInfo.roomUsers})
        // Watch for if its over the max value and change the button inputs
        setRoomInformation({...roomInformation, roomSize: `There are ${roomInfo.roomUsers.length}/ ${createRoomInputs.maxSize} present`});
        if (roomInfo.roomUsers.length >= createRoomInputs.maxSize){
          setIsRoomFull(true)
        } else{
          setIsRoomFull(false)
        };

      });
      //this emits on your initial room creation
      socket.on('roomCreationSuccess', (roomData) => {
        setRoomId(roomData.roomId);
        //Show success toast notif
        setShowToast(true);
        setToastMessage(`You have successfully created room: ${roomData.roomId}`);
        setToastType('success');
        setFormIsSubmitted(true);
        //change the privacy display text
        if (createRoomInputs.isPrivate){
          setRoomInformation({ ...setRoomInformation, isPrivate: 'Only those you are friends with can join this room'})
        }
      });
      socket.on('roomCreationFailure', (errorData) => {
        console.log(errorData.message)
      })
      return () => {
        /*socket.off('recieveRoomCount', () => {
          //do something
        })*/
      }
    }, [socket])
    

    //Purpose: first connect to the socket and then create a room
    const handleCreateRoom = async (e) => {
        try {
           e.preventDefault();
           if (!currentUser){
              throw 'you must be logged in first before creating a room'
           }
            await socket.connect();
            await socket.emit("joinRoom", createRoomInputs);
        } catch (error) {
            //throw a toast that something went wrong 
            console.log(error)
            setShowToast(true);
            setToastMessage(error);
            setToastType('danger')
        }
    };
    const handleStartGame = () => {

    };
    const handleAbandonGame = () => {

    };

    let displayRoomForm = (<h2>Please Login Prior to trying trying to create a room </h2>)
    if (currentUser){
      displayRoomForm = (
          <Form data-bs-theme="dark" className=" p-5 mb-2 bg-dark bg-gradient text-white form">
          <h1>Create a Boggle Party Lobby</h1>
          {/* Will need : max number of players, friends only, game type (big or little), letters used, enable custom words,  */}
          <h2  className="mb-3"> Room Settings</h2>
          <Form.Group className="mb-3">
                    <Form.Label> Your username </Form.Label>
                    <Form.Control 
                        type="text"
                        disabled
                        value={currentUser.username}
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
    //add in all your room components
    const multiplayerRoomHeader = (
      <section id = 'multiplayerRoomHeader' data-bs-theme="dark" className="bg-dark bg-gradient text-white form">
            <h2> Room Id: {roomId}</h2>
            <h2> Room Size: {roomInformation.roomSize}  </h2>
            <h3> Room Creator: {roomInformation.roomCreator}</h3>
            <div>
                <p> Link to join: {`http://${window.location.host}/joinroom/${roomId}`}</p>
                <p> {roomInformation.isPrivate}</p>
            </div>
      </section>
    )
    //Once we have a room id we open up a chatting option with whomever else is present and waiting
    const displayChat = formIsSubmitted && <Chat socket={socket} room={roomId} />
    const displayParticipants = formIsSubmitted && ''
    const displayGame = formIsSubmitted && ''
    const displayButtons = formIsSubmitted && ''

    return (
      <main>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '10', width:'600px', height:'200px', zIndex:'10'}} bg={toastType}>
          <Toast.Header>
            <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
            <strong className="me-auto">Boggle</strong>
            <small>Now</small>
          </Toast.Header>
            <Toast.Body> {toastMessage} </Toast.Body>
        </Toast>
        {formIsSubmitted ?  <></> : displayRoomForm}
        {formIsSubmitted ? multiplayerRoomHeader : <></>}
        <section id='gameSpace'>
          {displayParticipants}
          {displayGame}
          {displayChat}
        </section>
        <section id='gameButtons'>
            {displayButtons}
        </section>
      </main>
    );
  };