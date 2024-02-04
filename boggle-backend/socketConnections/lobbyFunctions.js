//defining all of our emitter and sender functions here for now
io = require('../server');


//Purpose: creates a room or adds a user to a lobby
/*      1. If you are the creator it initializes a room and adds all the custom attributes needed to a room
        2. If  you are a participant it adds you to a room and emits a recieveRoomCount to everyone else
*/
const joinRoom = async(roomStreamedInfo) => {
    //check if they are the creator
    if (roomStreamedInfo.isCreator){
        try {
            //Generate a random room seed id
            const roomId = Math.random().toString(20).substr(2, 10);
            //Join a room. This creates a new one if it doesnt exist
            await socket.join(roomId); //TODO want a custom throw if this fails
            userRooms.push(roomId)
            //Now add to this room the relevant information you want to keep directly to your socket adaptor
                //tbh i dont know if im supposed to be adding custom keys to prebuilt things but its an easy method
            io.of("/").adapter.rooms.get(roomId).creatorId       = userId;
            io.of("/").adapter.rooms.get(roomId).maxSize         = roomStreamedInfo.maxSize;
            io.of("/").adapter.rooms.get(roomId).isPrivate       = roomStreamedInfo.isPrivate;
            io.of("/").adapter.rooms.get(roomId).isInProgress    = false;
            io.of("/").adapter.rooms.get(roomId).users           = [{ username: userUsername, userId: userId }]; //note: you cant stream over arrays on emit, so you convert this to an object
            //emit a success message that you created the room
            io.in(roomId).emit("roomCreationSuccess", {
                roomId: roomId
            });
            
            let emittedCountObj = {};
            emittedCountObj[userId] = userUsername
            io.in(roomId).emit("recieveRoomCount", {
                roomId         : roomId,
                roomUsers      : emittedCountObj,
                roomCreatorId  : io.of("/").adapter.rooms.get(roomId).creatorId
            });
            console.log(`user with ID ${socket.id} and username ${userUsername} made room ${roomId}`);
        } catch (error) {
            //throwing an error will emit a socket error message eventually in the catch
            console.error('error in creating a room' + error);
            //since the room doesnt exist you DM your attempted creator directly
            io.to(`user:${userId}`).emit("roomCreationFailure", {message: "Something went wrong in creating a room. Try again"});
        }
    }else{
        try {
            let roomId = roomStreamedInfo.roomId;
            //check if they asked to join a room that exists
            if (io.sockets.adapter.rooms.get(roomId) === undefined){
                throw 'this room does not exist';
            };
            //check if the game is already in progress
            if (io.of("/").adapter.rooms.get(roomId).isInProgress) {
                throw 'this game is already in progress'
            }
            //check if it is at max capacity
            if (io.of("/").adapter.rooms.get(roomId).maxSize <= io.of("/").adapter.rooms.get(roomId).users.length) {
                throw 'this game is full'
            }
            //check if the room is private
            if (io.of("/").adapter.rooms.get(roomId).isPrivate){
                //check if they are friends with the owner
                let creatorId = io.of("/").adapter.rooms.get(roomId).creatorId;
                //note: both AB and BA exist if they are friends so this should be fine
                let areFriends = await User_Auth.findOne({ where: {
                    friendOneId: userId,
                    friendTwoId : creatorId,
                    isPending: false
                }});
                if (!areFriends){
                    throw 'this game is private, thus you must be friends with the creator to join'
                }                    
            }
            //If you get here you are allowed to join
            await socket.join(roomId);
            //add yourself to the users list
            io.of("/").adapter.rooms.get(roomId).users.push({username: userUsername, userId:userId});
            //to make it eaier on the front end, get the creator username by looping through and finding it from the .users
            let creatorUsername = '';
            io.of("/").adapter.rooms.get(roomId).users.forEach((userObj) => {
                if (userObj.userId == io.of("/").adapter.rooms.get(roomId).creatorId){
                    creatorUsername = userObj.username
                } 
            })
            io.to(`user:${userId}`).emit("roomJoinSuccess", {
                message     : `you have joined room ${roomId}`,
                roomCreator : creatorUsername,
                maxSize     : io.of("/").adapter.rooms.get(roomId).maxSize,
                isPrivate   : io.of("/").adapter.rooms.get(roomId).isPrivate  
            });

            let emittedCountObj = {};
            io.of("/").adapter.rooms.get(roomId).users.map((Obj)=>{
                emittedCountObj[Obj.userId] = Obj.username;
            });

            io.in(roomId).emit("recieveRoomCount", {
                roomId         : roomId,
                roomUsers      : emittedCountObj,
                roomCreatorId  : io.of("/").adapter.rooms.get(roomId).creatorId
            });
        } catch (error) {
            //eventually need to write a socket to handle this
            io.to(`user:${userId}`).emit("roomJoinFailure", {message: error});
        };
    };

};


//Purpose: Sends a message to everyone in your waiting room lobby OR after room lobby
const sendMessage = () => {

};


//Purpose: Handles Removing a user from the lobby if the creator decides to kick them
const kickUser = () => {

};


//Purpose: when a person navigates away from a multiplayer game this will either:
/*    1. Kick everyone else in the lobby if the disconnect was by the creator
      2. Remove them from the lobby and emit a recieveRoomCount to all others in the lobby
*/
const disconnect = () => {

}


module.exports = { joinRoom , sendMessage, kickUser, disconnect };