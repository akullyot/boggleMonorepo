import { useEffect, useState, useContext}    from "react";
import { CurrentUser }            from "../../Contexts/CurrentUser";


export default function Chat( {socket, roomId}){
    const { currentUser } = useContext(CurrentUser);
    const [currentMessage, setCurrentMessage] = useState("");
    const [allMessages, setallMessages] = useState([]);
    const handleSendMessage = async () => {
        if (currentMessage !== ""){
            const messageData = {
                roomId: roomId,
                message: currentMessage,
                time: `${new Date().getHours()}:${new Date().getMinutes()}`,
            };
            setCurrentMessage("");
            try {
                //TODO check message isnt an insane size
                await socket.emit("sendMessage", messageData);
               
            } catch (error) {
                //TODO do something on a fail 
                console.log(error)
            }
        }
    };
    useEffect(() => {
        socket.on("recieveMessage", (recievedMessage) => {
            setallMessages((array) => [...array, recievedMessage])
        });
        return () => {
           socket.off("recieveMessage");
        }
    }, [socket]);

    return(
        <div id="chatHolder" className="bg-dark bg-gradient text-white ">
            <div className="header">
                <h2> Chat Room </h2>
                <h5> Lobby </h5>
            </div>
            <div className="body">
                { allMessages.map((messageInfo, index) => {
                    if (messageInfo.sender == currentUser.username){
                        return(
                        <div className="sentMessage" key={index}>
                            <p className="messageHeader">{messageInfo.sender} at {messageInfo.time}</p>
                            <p className="messageContent">{messageInfo.message}</p>
                        </div> 
                        )  
                    }else{
                        return(
                        <div className="recievedMessage" key={index}>
                            <p className="messageHeader">{messageInfo.sender} at {messageInfo.time}</p>
                            <p className="messageContent">{messageInfo.message}</p>
                        </div>
                        )
                    }
                })}
            </div>
            <div className="chatFooter">
                <input type="text" placeholder="Message...." value = {currentMessage} onChange={(e)=>setCurrentMessage(e.target.value)}></input>
                <button onClick={handleSendMessage}> &#9658; </button>
            </div>
        </div>
    )
}