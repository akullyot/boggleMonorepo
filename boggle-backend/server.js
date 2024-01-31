// DEPENDENCIES and GLOBAL MODULES
require('dotenv').config();
const express           = require('express');
const bodyParser        = require('body-parser');
const cors              = require('cors');
const path              = require('path');
const app               = express();
const defineCurrentUser = require('./middleware/defineCurrentUser.js'); //middleware for jwt tokens
const { Sequelize }     = require('sequelize');
const http              = require('http'); //required for sockets
const {Server}          = require("socket.io");
const server            = http.createServer(app);
//used for connecting a socketID to a jwt
const defineCurrentUserSocket = require('./middleware/socketDefineCurrentUser.js'); //middleware for jwt tokens 





// CONFIGURATION / MIDDLEWARE /EXPRESS
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); //note: probably wont need
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(defineCurrentUser);

//CONFIGURATION/ MIDDLEWARE / SOCKET



    //TODO move this out of server.js
const io = new Server(server, {cors : {
    origin: process.env.REACT_SERVER, //which url is calling and making calls to our socketio server, so our react server
    methods: ["GET", "POST"], 
}});
//Set up the middleware for jwt handshakes
io.engine.use(defineCurrentUserSocket);
//ALL OF OUR POSSIBLE SOCKET EMMITTERS AND RECIEVERS
const db = require("./models")
const { User_Friendship } = db;

io.on("connection", (socket) => {
    console.log(socket.id, 'socketID has connected');
    //make them their own special room so you can easily dm on errors
    const userUsername = socket.request.currentUser.username;
    const userId = socket.request.currentUser.id;
    socket.join(`user:${socket.request.currentUser.id}`);
    //holds all rooms youre in for easier handling of disconnecting cleanup
    const userRooms = [];
    //SOCKET EMITTER AND RECIEVERS
    socket.on("joinRoom", async (roomStreamedInfo) => {
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
                io.of("/").adapter.rooms.get(roomId).users           = [{ username: userUsername, userId: userId}];

                //emit a success message that you created the room
                io.in(roomId).emit("roomCreationSuccess", {
                    roomId: roomId
                });
                //next emit the recieve room count that you use to update room count
                io.in(roomId).emit("recieveRoomCount", {
                    roomId         : roomId,
                    roomUsers      : io.of("/").adapter.rooms.get(roomId).users,
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
                io.to(`user:${userId}`).emit("roomJoinSuccess", {message: `you have joined room ${roomId}`});
                io.in(roomId).emit("recieveRoomCount", {
                    roomId         : roomId,
                    roomUserIds    : io.of("/").adapter.rooms.get(roomId).users,
                    roomCreatorId  : io.of("/").adapter.rooms.get(roomId).creatorId
                });
            } catch (error) {
                //eventually need to write a socket to handle this
                io.to(`user:${userId}`).emit("roomJoinFailure", {message: error});
            };
        };
    });

    socket.on("sendMessage", (messageData) => {
        console.log(messageData);
        //Now send to the frontend to anyone in the same room
        socket.to(messageData.roomId).emit("recieveMessage", {
            sender: userUsername,
            message: messageData.message,
            time: messageData.time
        });
        console.log('message sent')
    });
    //Purpose: Cleans up disconnecting via the following
    // takes them out of the room, and if the room hits 0 people removes it from the roomCount obj
    socket.on("disconnect", async () => {
        //this should just be a full socket is lost  disconnect, not just a room disconnect
        //on disconnect check if they are a part of any rooms
        userRooms.forEach(roomId => {
            //If youre the only one to exist in the room its already gone once you get here
            if (io.of("/").adapter.rooms.get(roomId) !== undefined){
                let ioOfRoom = io.of("/").adapter.rooms.get(roomId);
                if (ioOfRoom.creatorId === userId){
                    //TODO you should be able to write an onRoom disconnect emission 
                    //kick everyone
                    io.in(roomId).socketsLeave(roomId);   
                }else{
                    //just delete yourself from the users array
                    ioOfRoom.users.forEach((userObj, index) => {
                        if (userObj.userId == userId ){
                            delete ioOfRoom.users[index]
                        }
                    });
                    //TODO emit out that someone left to everyone in the room
                }
            };
            //Note: you dont need to clean up anything else here because your entire socket is being killed here,
            //just need to clean up io's others may be in to recognize you left
        });
        console.log("User Disconnected", socket.id) // this id changes every time you refresh
    });

})


//ROUTES
    //CONTROLLER ROUTES
app.use('/users',          require('./controllers/users'));
app.use('/authentication', require('./controllers/authentication'));
    //CATCHALL ROUTE
app.get('*', (req,res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.status(404).json({message: 'Request not found'});
});

//LISTEN
server.listen(process.env.PORT, () => {
    console.log(`Boggle Backend app listening at http://localhost:${process.env.PORT}`);
});