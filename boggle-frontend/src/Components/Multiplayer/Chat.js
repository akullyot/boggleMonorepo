import { useEffect, useState, useContext}    from "react"
import { CurrentUser }            from "../../Contexts/CurrentUser"

export default function Chat( {socket, room}){
    const { currentUser } = useContext(CurrentUser);
    const username = currentUser.username;
    const [currentMessage, setCurrentMessage] = useState("");
    const handleSendMessage = async () => {
        if (currentMessage !== ""){
            //actual message, the username, and the time they sent it
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time: new Date().getHours() + ":" + new Date().getMinutes()
            };
            //emit a socket message
            await socket.emit("sendMessage", messageData)
        }
    };
    useEffect(() => {
        console.log('here')
        socket.on("recieveMessage", (recievedData) => {
            console.log(recievedData);
        });

    }, [socket])
    return(
        <div>
            <div className="chatHeader">
                <p> Chat Between those in room Id: {room}</p>
            </div>
            <div className="chatBody">

            </div>
            <div className="chatFooter">
                <input type="text" placeholder="Message...." onChange={(e)=>setCurrentMessage(e.target.value)}></input>
                <button onClick={handleSendMessage}> &#9658; </button>
            </div>
        </div>
    )
}