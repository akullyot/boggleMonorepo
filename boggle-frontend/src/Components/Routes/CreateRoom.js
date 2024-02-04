
//Import in all hooks and dependencies
import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate }                             from "react-router-dom";
import { CurrentUser }                             from "../../Contexts/CurrentUser"
import { socket }                                  from  "../../Contexts/Socket"
//All required media
import logo from '../../Assets/Images/blocks.png'
import { spiral } from 'ldrs'

//Import in all react components
import Chat from '../Multiplayer/Chat';
import BoggleGame from '../Multiplayer/BoggleGame'
//import in all bootstrap components
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


export default function CreateRoom() {
//Required imports
  const { currentUser } = useContext(CurrentUser);
  const navigate = useNavigate();
  spiral.register()

//All state Variables
    //FORM vars
      //Initial Form Values for creating a room
      const [createRoomInputs, setCreateRoomInputs] = useState({
        maxSize: 3,
        isPrivate : false,
        isCreator: true
      });
      //Initial Values that need to be sent to the backend to create a game
      const [createRoomGameInputs, setCreateRoomGameInputs] = useState({
          gameType: 'fourXFourClassic'
          //more stuff will likely be needed eventually
      });
      //Initial Values that change the front end play experience
      const [createRoomFrontendGameInputs, setCreateRoomFrontendGameInputs] = useState({
          minutesDuration:5,
          // others that will be eventually added 
          isVoting: false, //after the game lobby can vote on validity 
          turnOnAutoCheck: false,
          dictionaryUsed: 'scrabble'
      });
    //HANDLING FORM SUBMISSION 
      //display toggler state variable
      const [formIsSubmitted, setFormIsSubmitted] = useState(false);
      const [gameIsLoaded, setGameIsLoaded]     = useState(false);
      const [gameIsStarted, setGameIsStarted]     = useState(false);
      //room information
      const [roomId, setRoomId] = useState(null);
      const [roomParticipants, setRoomParticipants] = useState([]);
      const [isRoomFull, setIsRoomFull] = useState(false);
      const [roomInformation, setRoomInformation] = useState({
        roomCreator: 'You are the room creator',
        isPrivate: 'Anyone logged in may join your room',
        roomSize: '' // 'There are x/y people present'
      });
      //board information
      const [seed, setSeed] = useState(null);
      const [boardMatrix, setBoardMatrix] = useState(null);

    //HANDLING TOAST NOTIFICATIONS
      //TODO right now there is only one toast and it will be rewritten if another result comes in before it closes. 
      //toast notifications state variables
      const [showToast, setShowToast] = useState(false);
      const [toastType, setToastType] = useState('');
      const [toastMessage, setToastMessage] = useState('');
//UNLOADING USEEFFECT to make sure all sockets disconnect
useEffect(() => {
  const handleUnload = () => {
    if (formIsSubmitted){socket.disconnect()}};
  window.addEventListener('unload', handleUnload);
  return () => {window.removeEventListener('unload', handleUnload);};
}, []);
//SOCKET USEEFFECT
  useEffect(() => {
      //GENERAL LOBBY LISTENERS
    socket.on('recieveRoomCount', (roomInfo) => {
      //the setting of arrays using setstate is proving to be very finicky. Im going to make this a csl string to avoid these problems
      setRoomParticipants(roomInfo.roomUsers)
      // Watch for if its over the max value and change the button inputs
      setRoomInformation({...roomInformation, roomSize: `There are ${roomInfo.roomUsers.length} / ${createRoomInputs.maxSize} present`});
      if (roomInfo.roomUsers.length >= createRoomInputs.maxSize){
        setIsRoomFull(true)
      } else{
        setIsRoomFull(false)
      };
    });

    //SUCCESS/FAIL EMISSIONS
    //Inital room creation
      socket.on('roomCreationSuccess', (roomData) => {
        setRoomId(roomData.roomId);
        //Show success toast notif
        setShowToast(true);
        setToastMessage(`You have successfully created room: ${roomData.roomId}`);
        setToastType('success');
        setFormIsSubmitted(true);
        //
        //change the privacy display text
        if (createRoomInputs.isPrivate){
          setRoomInformation({ ...setRoomInformation, isPrivate: 'Only those with whom you are friends can join this room'})
        }
      });
      socket.on('roomCreationFailure', (errorData) => {
        console.log(errorData.message)
      });
    //Kicking user
      socket.on('kickUserSuccess', (successMessage) => {

      });
      socket.on('kickUserFailure', (errorMessage) => {

      });
    //start the game
      socket.on("startGame", () => {
          setGameIsStarted(true);
      });

    //after you recieve an emission, take off the listener to prevent double listens
    return () => {
      socket.off("recieveRoomCount");
      socket.off("roomCreationSuccess");
      socket.off("roomCreationFailure");
      socket.off('kickUserSucess');
      socket.off('kickUserFailure');
    }
    }, [socket])
//BUTTONS
    //Purpose: first connect to the socket and then create a room
    const handleCreateRoom = async (e) => {
        try {
          e.preventDefault();
          if (!currentUser){
            throw 'you must be logged in first before creating a room'
          }
          const response = await fetch(`http://localhost:5000/games/newgame`, {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createRoomGameInputs)
          });
          const boardData = await response.json();
          if(boardData && response.status === 200){
            //set your seed
            setSeed(boardData.seed);
            setBoardMatrix(boardData.boardMatrix);
            setGameIsLoaded(true);
            //now connect to your socket
            socket.connect();
            //todo: you actually need to add in the seed for the other players, and isAutocheck
            // so they know what to send to express
            socket.emit("joinRoom", {...createRoomInputs, seed: boardData.seed });
          }else{
            throw 'error in creating the game board. Please try again.'
          }
        } catch (error) {
            //throw a toast that something went wrong 
            console.log(error)
            setShowToast(true);
            setToastMessage(error);
            setToastType('danger')
        }
    };
    //
    const handleStartGame = () => {
      try {
        if(!gameIsLoaded){
          throw 'game has not been generated yet, please try again.'
        };
        //emit out a start game signal
        //this will likely cause issues because people join the game then actually make the https req to generate
        //the board
        //TODO: add a check to see if everyone has made their board first 
        socket.emit("toggleStartGame", {roomId:roomId}) 
      } catch (error) {
        console.log(error)
      }



    };
    const handleAbandonGame = () => {
        //Sockets handle disconnects quite well, just navigate home with a message that the game has left
        socket.disconnect();
        navigate('/?leftGame=true');

    };
    const handleSendFriendRequest = async (userId) => {

    };
    const handleKickUser = (username) => {
      //send an emit message to kick the user. The result will come back as a kickUserSuccess
        socket.emit("kickUser", ({
          roomId: roomId,
          userToKick: username
        }));
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
                        max={10}
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
          <Form.Group>
            <Form.Label>Game Type</Form.Label>
            <Form.Select className="mb-3"  required onChange={e=> setCreateRoomGameInputs({...createRoomGameInputs, gameType: e.target.value})} value={createRoomGameInputs.gameType}>
              <option value="fourXFourClassic">4x4 with the classic Boggle Dice</option>
              <option value="fourXFourNew">4x4 with the new Boggle dice</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
                    <Form.Label>Game Duration (minutes)</Form.Label>
                    <Form.Control 
                        type="number"
                        min={1}
                        max={5}
                        value={createRoomFrontendGameInputs.minutesDuration}
                        onChange={e => setCreateRoomFrontendGameInputs({ ...createRoomFrontendGameInputs, minutesDuration: e.target.value })}
                        required
                    />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check 
                type="checkbox" 
                label="Autocheck All User Inputs" 
                value={createRoomFrontendGameInputs.turnOnAutoCheck}
                onChange={e => setCreateRoomFrontendGameInputs({ ...createRoomFrontendGameInputs, turnOnAutoCheck: e.target.value })}
                required
              />
          </Form.Group>
          <Button variant="outline-light" size="lg" type="submit" className="mb-5" onClick={handleCreateRoom}>
              Create a Room      
          </Button>
        </Form>
      )
    };
    //add in all your room components
    const multiplayerRoomHeader = (
      <section id = 'multiplayerRoomHeader' data-bs-theme="dark" className="bg-dark bg-gradient text-white form">
            <h4 id='roomTitle'> Room Id: {roomId}</h4>
            <h5> {roomInformation.roomCreator}</h5>
            <div id="linkHolder">
                <p id='roomLink'> Link to join: <span> {`http://${window.location.host}/joinroom/${roomId}`} </span></p>
                <p id= 'privateInfo'> {roomInformation.isPrivate}</p>
            </div>
      </section>
    );
    let displayParticipants = (<></>);
    if (roomParticipants && !gameIsStarted){
      displayParticipants = (
        <div id='participantsHolder' className="bg-dark bg-gradient text-white">
          <div id='participantHeader' className='header'>
            <h2> All Participants </h2>
            <h5>{roomInformation.roomSize}</h5>
          </div>
          <div className='body'>
            {roomParticipants.map((userObj, index) => {
              if (userObj.username === currentUser.username){
                return(
                  <div key={index}className='participantYou'>
                      <p > {userObj.username} (You) </p>
                  </div>
                )
              }else{
                return(
                  <div key={index} className='participantElse'>
                     <p> {userObj.username}</p>
                     <Button  variant="success"  onClick={handleSendFriendRequest(userObj.username)}> Add Friend </Button>
                     <Button  variant="danger" onClick={handleKickUser(userObj.userId)}> Kick User </Button>
                  </div> 
                )
              }
            })}
          </div>
  
        </div>
      )
    }

    const displayButtons = (
      <div id="buttonsHolder">
          <Button id='startButton' onClick={handleStartGame}> Start Game</Button>
          <Button  id="abandonButton" onClick={handleAbandonGame}> Abandon Game</Button>
      </div>
    )
    //Once we have a room id we open up a chatting option with whomever else is present and waiting
    const displayChat = formIsSubmitted && <Chat socket={socket} roomId={roomId} />
    //You have the game space that will go in the middle
    const displaygameWaiting = (<div className='boggleBoard bg-dark bg-gradient'><l-spiral size="70"speed="1.6" color="lightgreen"></l-spiral><h2> Waiting for all Members</h2></div>);
    const displayLobbyHolder = (
      <>
        {formIsSubmitted ? multiplayerRoomHeader : <></>}
        <section id='gameSpace'>
          {formIsSubmitted ? displayParticipants : <></>}
          {formIsSubmitted ?  displaygameWaiting : <></>}
          {displayChat}
        </section>
        <section id='gameButtons'>
            {formIsSubmitted ? displayButtons : <></>}
        </section>
      </>
    );
    //The game holder
    const displayGame = gameIsStarted && <BoggleGame socket={socket} roomId={roomId} seed={createRoomGameInputs.seed} boardMatrix = {boardMatrix} setBoardMatrix={setBoardMatrix} createRoomFrontendGameInputs= {createRoomFrontendGameInputs}/>;




    return (
      <main>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '10', width:'600px', height:'200px', zIndex:'10'}} bg={toastType} data-bs-theme="dark">
          <Toast.Header>
            <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
            <strong className="me-auto">Boggle</strong>
            <small>Now</small>
          </Toast.Header>
            <Toast.Body > {toastMessage} </Toast.Body>
        </Toast>
        {formIsSubmitted  ?  <></> : displayRoomForm}
        {gameIsStarted ?  displayGame : displayLobbyHolder}
        

      </main>
    );
  };