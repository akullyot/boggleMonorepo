
//Import in all hooks and dependencies
import { useState, useEffect, useContext, useRef   } from 'react';
import { useParams }                                 from 'react-router-dom';
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



export default function JoinRoom (){
    const { roomId } = useParams();
    const fullUrl = window.location.href;
    let { currentUser } = useContext(CurrentUser);
    let [showToast, setShowToast] = useState(false);
    let [toastType, setToastType] = useState('');
    let [toastMessage, setToastMessage] = useState('');
    let [roomInformation, setRoomInformation] = useState({
        roomId : roomId,
        roomCreator: '',
        roomParticipants : '',
        maxSize: 0,
        isPrivate: 'anyone logged in is free to join this room'
    });
    let [isConnected, setisConnected] = useState(false);


    useEffect(() => {
        try {
            if (!currentUser){
                throw 'please login first before trying to join a room'
            }
            socket.connect();
            socket.emit("joinRoom", {roomId:roomId, isCreator: false});
        } catch (error) {
            console.log(error)
        }
    }, [roomId]);
    //listens for all socket changes
    useEffect(() => {
      //this emits out any time someone joins
      socket.on('recieveRoomCount', (roomInfo) => {
       // setRoomParticipants(roomInfo.roomUsers);

        // Watch for if its over the max value and change the button inputs
      });
      //this emits on your initial room creation
      socket.on('roomJoinSuccess', (roomData) => {
        //Show success toast notif
         //emits to you the max room length, the creator username, and if it is private
        setRoomInformation({...roomInformation, 
            roomCreator: roomData.roomCreator, 
            maxSize: roomData.maxSize,
        });

        if(roomData.isPrivate){
            setRoomInformation({...roomInformation, 
                isPrivate: `Room is set to private, only those who are friends with ${roomData.roomCreator} will be able to join.`})
        };
        setShowToast(true);
        setToastMessage(`You have successfully joined room: ${roomId}`);
        setToastType('success');
        setisConnected(true);
      })
      return () => {
        /*socket.off('recieveRoomCount', () => {
          //do something
        })*/
      }
    }, [socket]);

    //Components rendered upon room success
    //add in all your room components
    const multiplayerRoomHeader = (
        <section id = 'multiplayerRoomHeader' data-bs-theme="dark" className="bg-dark bg-gradient text-white form">
              <h2 id='roomTitle'> Room Id: {roomId}</h2>
              <h4> {roomInformation.roomCreator} is the lobby creator</h4>
              <div id="linkHolder">
                  <p id='roomLink'> Link to join: <span> {`http://${window.location.host}/joinroom/${roomId}`} </span></p>
                  <p id= 'privateInfo'> {roomInformation.isPrivate}</p>
              </div>
        </section>
      );



    //Once we have a room id we open up a chatting option with whomever else is present and waiting
    const displayChat =  isConnected && <Chat socket={socket} room={roomId} />
    //You have the game space that will go in the middle
    const displayGame = isConnected && '<BoggleGame socket={socket} />';
    //the title space will be replaced by the timer
    //the all participants will leave
    //the chat room will convert to the found words region


    return(
        <main>
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '10', width:'600px', height:'200px', zIndex:'10'}} bg={toastType}>
                <Toast.Header>
                <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
                <strong className="me-auto">Boggle</strong>
                <small>Now</small>
                </Toast.Header>
                <Toast.Body> {toastMessage} </Toast.Body>
            </Toast>
                {isConnected ? multiplayerRoomHeader: <></>}
                <section id='gameSpace'>
                    {displayGame}
                    {displayChat}
                </section>


        </main>
    );
}