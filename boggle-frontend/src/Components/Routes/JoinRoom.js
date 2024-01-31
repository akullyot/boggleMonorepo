
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
        roomParticipants : [], //array of objs of the structure: username: username, userId: userid 
        maxSize: 0,
        isPrivate: 'anyone logged in is free to join this room'
    });



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
        setShowToast(true);
        setToastMessage(`You have successfully joined room: ${roomId}`);
        setToastType('success');
      })
      return () => {
        /*socket.off('recieveRoomCount', () => {
          //do something
        })*/
      }
    }, [socket]);

    //Components rendered upon room success
    let multiplayerRoomHeader = (
        <section id= "multiplayerRoomHeader">
            <h1> Room Id: {roomId} </h1>
            <h2> Room Size: </h2>
            <h3> Room Creator: {roomInformation.roomCreator}</h3>
            <div>
                <p> Link to join: {fullUrl}</p>
                <p> {roomInformation.isPrivate}</p>
            </div>
        </section>
    )



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
            
                {multiplayerRoomHeader}

        </main>
    );
}