import { useEffect, useState, useContext}    from "react"
import { CurrentUser }            from "../../Contexts/CurrentUser"

export default function Chat( {socket, room}){
    const { currentUser } = useContext(CurrentUser);
    const [currentMessage, setCurrentMessage] = useState("");
    const [allMessages, setallMessages] = useState([]);
    const handleSendMessage = async () => {
        if (currentMessage !== ""){
            const messageData = {
                roomId: room,
                message: currentMessage,
                time: `${new Date().getHours()}:${new Date().getMinutes()}`
            };
            try {
                await socket.emit("sendMessage", messageData);
                setallMessages((array) => [...array, {
                    sender: currentUser.username,
                    message: messageData.message,
                    time: messageData.time
                }]);

            } catch (error) {
                //TODO do something on a fail 
            }
        }
    };
    useEffect(() => {
        socket.on("recieveMessage", (recievedMessage) => {
            setallMessages((array) => [...array, recievedMessage])
        });
        return () => {
            //TODO handle taking sockets off
        }

    }, [socket]);

    return(
        <div id="chatHolder">
            <div className="chatHeader">
                <p> Chat Room </p>
            </div>
            <div className="chatBody">
                { allMessages.map((messageInfo) => {
                    if (messageInfo.sender == currentUser.username){
                        return(
                        <div className="sentMessage">
                            <p>{messageInfo.sender} at {messageInfo.time}</p>
                            <p>{messageInfo.message}</p>
                        </div> 
                        )  
                    }else{
                        return(
                        <div className="recievedMessage">
                            <p>{messageInfo.sender} at {messageInfo.time}</p>
                            <p>{messageInfo.message}</p>
                        </div>
                        )
                    }
                })}
            </div>
            <div className="chatFooter">
                <input type="text" placeholder="Message...." onChange={(e)=>setCurrentMessage(e.target.value)}></input>
                <button onClick={handleSendMessage}> &#9658; </button>
            </div>
        </div>
    )
}