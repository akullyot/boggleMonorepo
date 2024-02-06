import { useState, useEffect, useContext }         from 'react';
import { useNavigate, useParams }                  from "react-router-dom";
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




export default function JoinRoom2 (){
    //required imports and declarations
        const { currentUser } = useContext(CurrentUser);
        const navigate = useNavigate();
        spiral.register();
        const { roomId } = useParams();
        const fullUrl = window.location.href;


    //All state variables
        //basic rendering Variables
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [roomJoinFailure, setRoomJoinFailure] = useState(false);
        const [roomJoinErrorMessage, setRoomJoinErrorMessage] = useState('');
        const [isRoomJoined, setisRoomJoined] = useState(false)
        //all room Information variables
        const [roomParticipants, setRoomParticipants] = useState([]);
        const [createRoomFrontendGameInputs, setCreateRoomFrontendGameInputs] = useState({
            minutesDuration :'',
            // others that will be eventually added 
            isVoting         : false, //after the game lobby can vote on validity, eventually will implement
            turnOnAutoCheck  : '', // eventually want to change this to be autocheck on keystroke, then diff variable for checking word against dict
            dictionaryUsed   : 'scrabble' //eventually will implement
        });
        const [roomInformation, setRoomInformation] = useState({
            roomCreator: '',//{username} is the room creator,
            isPrivate  : '', // anyone may join this room/ only those who are friends with the creator can join this room
            roomSize: '' //there are x/y people present
        });
        const [isRoomFull, setIsRoomFull] = useState(false);
        //all board information
        const [gameIsLoaded, setGameIsLoaded] = useState(false);
        const [gameIsStarted, setGameIsStarted] = useState(false);
        const [seed, setSeed] = useState(null);
        const [boardMatrix, setBoardMatrix] = useState(null);
        //HANDLING TOAST NOTIFICATIONS
        //TODO right now there is only one toast and it will be rewritten if another result comes in before it closes. 
        //toast notifications state variables
        const [showToast, setShowToast] = useState(false);
        const [toastType, setToastType] = useState('');
        const [toastMessage, setToastMessage] = useState('');


    //All UseEffects
        //Initial Render UseEffect to check if the user is logged in
        useEffect(() => {
            try {
                if (!currentUser){
                    throw 'please login first before trying to join a room'
                }
                //Making it not fire twice
                if (!isRoomJoined){
                    socket.connect();
                    socket.emit("joinRoom", {roomId: roomId, isCreator: false});
                    setisRoomJoined(true);
                }
            } catch (error) {
                setIsLoggedIn(true);
                setShowToast(true);
                setToastType('danger');
                setToastMessage(error)
            }
            const handleUnload = () => {
                if (isRoomJoined){socket.disconnect()}};
              window.addEventListener('unload', handleUnload);
              return () => {window.removeEventListener('unload', handleUnload);};
        }, []);
        //SOCKET USEEFFECT
        useEffect(() => {
            //GENERAL LOBBY LISTENERS
            socket.on("roomJoinSuccess", async (roomData) => {
                try {
                   console.log(roomData);
                    setRoomInformation({roomCreator: roomData.roomCreator,
                        isPrivate: roomData.isPrivate ? 'Only those that are friends with the room creator can join' : 'Anyone logged in may join',
                        maxSize: roomData.maxSize
                    });

                    setCreateRoomFrontendGameInputs({ ...createRoomFrontendGameInputs,
                        minutesDuration : roomData.minutesDuration,
                        turnOnAutoCheck: roomData.isAutocheck
                    })
                    //Now go over to the backend and generate your board
                    const response = await fetch(`${process.env.REACT_APP_NODE_SERVER_URL}/games/joinGame`, {
                        method: 'POST',
                        headers: {
                            'authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({seed: roomData.seed})
                      });
                      const boardData = await response.json();
                      if (boardData && response.status === 200){
                            setBoardMatrix(boardData.boardMatrix);
                            setGameIsLoaded(true);

                      }else{
                        throw 'board generation failed';
                      }
                } catch (error) {
                    socket.disconnect();
                    setRoomJoinFailure(true);
                    setRoomJoinErrorMessage(`Although the socket allowed you to join, the following error occured : ${error}`);
                } 
            });
            socket.on("joinRoomFailure", (errorData) => {
                setRoomJoinFailure(true);
                setRoomJoinErrorMessage(`Socket denied your room joining for this reason: ${errorData.message}`)
            });
            socket.on('recieveRoomCount', (roomInfo) => {
                console.log(roomInfo)
                setRoomParticipants(roomInfo.roomUsers)
                // Watch for if its over the max value and change the button inputs
                setRoomInformation({...roomInformation, roomSize: `There are ${roomInfo.roomUsers.length} / ${roomInformation.maxSize} present`});
                if (roomInfo.roomUsers.length >= roomInformation.maxSize){
                  setIsRoomFull(true)
                } else{
                  setIsRoomFull(false)
                };
              });
              socket.on("startGame", () => {
                    setGameIsStarted(true);
              })

            socket.on("disconnect", (disconnectMessage) => {        
                console.log(disconnectMessage); // youre likely expecting this to be "transport close"
                //but you will also get here if you are kicked, but the user doesnt need to know they were kicked
                navigate('/?leftGame=error');
            });
            return () => {
                socket.off('disconnect');
                socket.off('joinRoomSucess');
                socket.off('joinRoomFailure');
                socket.off('recieveRoomCount')
                socket.off('joinRoom');
                socket.off('startGame');
            }
        },[socket]);
    

    //All Button Handles
        const handleRedirectToLogin = () => {
            navigate('/signup')
        }
        const handleRedirectToHome = () => {
            navigate("/")
        };
        const handleAbandonGame = () => {
            //Sockets handle disconnects quite well, just navigate home with a message that the game has left
            socket.disconnect();
            navigate('/?leftGame=true');
        };
        const handleSendFriendRequest = async (userId) => {

        };
    //All Renderings
        const displayLoginError = (
            <div id="loginRedirect" className='errorDiv'>
                <h2> Please login prior to accessing a multiplayer Room </h2>
                <button onClick = {handleRedirectToLogin}> Login / Sign Up </button>
            </div>
        );
        const displayRoomJoinFailure = (
            <div id="RoomFailure" className='errorDiv'>
                <h2> Either this roomID does not have a room associated with it, the game is in progress, or you do not have the permissions to join. </h2>
                <h3> Please try a different room  or try again</h3>
                <p>{roomJoinErrorMessage}</p>
                <button onClick = {handleRedirectToHome}> Return Home</button>
            </div>
        );
        let displayLobby = (
            <>
            </>
        )
        if (gameIsLoaded){
            displayLobby = (
                <>
                    
                    <section id = 'multiplayerRoomHeader' data-bs-theme="dark" className="bg-dark bg-gradient text-white form">
                        <h4 id='roomTitle'> Room Id: {roomId}</h4>
                        <h5> {roomInformation.roomCreator}</h5>
                        <div id="linkHolder">
                            <p id='roomLink'> Link to join: <span> {`http://${window.location.host}/joinroom/${roomId}`} </span></p>
                            <p id= 'privateInfo'> {roomInformation.isPrivate}</p>
                        </div>
                    </section>

                    <section id="gameSpace">
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
                                </div> 
                                )
                            }
                            })}
                        </div>
                        </div>
                        <div className='boggleBoard bg-dark bg-gradient'><l-spiral size="70"speed="1.6" color="lightgreen"></l-spiral><h2> Waiting for all Members</h2></div>
                        <Chat socket={socket} roomId={roomId} />
                    </section>
                    <section id="gameButtons">
                    <div id="buttonsHolder">
                        <Button  id="abandonButton" onClick={handleAbandonGame}> Abandon Game</Button>
                    </div>
                    </section>
    
                </>
            )

        };
        const displayGame = gameIsStarted && <BoggleGame socket={socket} roomId={roomId} seed={seed} boardMatrix = {boardMatrix} setBoardMatrix={setBoardMatrix} createRoomFrontendGameInputs= {createRoomFrontendGameInputs} roomParticipants={roomParticipants}/>;



    return(
        <main>
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '10', width:'600px', height:'200px', zIndex:'10'}} bg={toastType} data-bs-theme="dark">
            <Toast.Header>
                <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
                <strong className="me-auto">Boggle</strong>
                <small>Now</small>
            </Toast.Header>
                <Toast.Body > {toastMessage} </Toast.Body>
            </Toast>
            {gameIsStarted ? displayGame : displayLobby}
        </main>

    )
}