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
const { all } = require('./controllers/users');
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
io.on("connection", (socket) => {
    console.log(socket.id, 'socketID has connected');
    //make them their own special room so you can easily dm on errors
    const userUsername = socket.request.currentUser.username;
    socket.join(`user:${socket.request.currentUser.username}`);

    //SOCKET EMITTER AND RECIEVERS
    socket.on("joinRoom", async (roomStreamedInfo) => {
        //check if they are the creator
        if (roomStreamedInfo.isCreator){
            try {
                //Generate a random room seed id
                const roomId = Math.random().toString(20).substr(2, 10);
                //Join a room. This creates a new one if it doesnt exist
                await socket.join(roomId); //TODO want a custom throw if this fails
                //Now add to this room the relevant information you want to keep directly to your socket adaptor
                    //tbh i dont know if im supposed to be adding custom keys to prebuilt things but its an easy method
                io.of("/").adapter.rooms.get(roomId).creatorUsername = socket.request.currentUser.username;
                io.of("/").adapter.rooms.get(roomId).maxSize      = roomStreamedInfo.maxSize;
                io.of("/").adapter.rooms.get(roomId).isPrivate       = roomStreamedInfo.maxSize;
                io.of("/").adapter.rooms.get(roomId).isInProgress    = roomStreamedInfo.maxSize;
                io.of("/").adapter.rooms.get(roomId).users           = roomStreamedInfo.maxSize;
                //emit a success message that you created the room
                io.in(roomId).emit("roomCreationSuccess", {
                    roomId: roomId
                });
                //next emit the recieve room count that you use to update room count
                io.in(roomId).emit("recieveRoomCount", {
                    roomId : roomId,
                    roomUsers : io.of("/").adapter.rooms.get(roomId).users,
                    roomCreator: io.of("/").adapter.rooms.get(roomId).creatorUsername
                });
                console.log(`user with ID ${socket.id} and username ${userUsername} made room ${roomId}`);
            } catch (error) {
                //throwing an error will emit a socket error message eventually in the catch
                console.error('error in creating a room' + error);
                //since the room doesnt exist you DM your attempted creator directly
                io.to(`user:${socket.request.currentUser.username}`).emit("roomCreationFailure", {message: "Something went wrong in creating a room. Try again"});
            }
        }else{
            //NOTE: A non room creator just sends over their username and the room id
            try {
                //check if they asked to join a room that exists
                if (!allRooms[roomStreamedInfo.roomId]){
                    throw 'this room does not exist';
                }else{
                    //for readability
                    const roomToJoin = allRooms[roomStreamedInfo.roomId]
                    if (roomToJoin.isInProgress){
                        throw 'game is already in progress'
                    };
                    if (roomToJoin.maxSize >= roomToJoin.users.length){
                        throw 'game is full'
                    };
                    if (roomToJoin.isPrivate){
                        const creatorUsername = roomToJoin.creator;
                        const joinerUsername =  roomStreamedInfo.userName;
                        //Need to make the data table first before you can actually do this lol
                        //TODO
                        roomToJoin.users.push(roomStreamedInfo.userName)
                        socket.join(roomStreamedInfo.roomId);
                        socket.room = roomStreamedInfo.roomId; //TODO look this up, feels redundant
                        //emit over to the room that a person has joined
                        socket.to(roomStreamedInfo.roomId).emit("recieveRoomCount", roomToJoin)  
                        console.log(`user with ID ${socket.id} joined room ${roomStreamedInfo.roomId}`);
                    }else{
                        //you are good to join
                        //establish this id as having joined the room
                        roomToJoin.users.push(roomStreamedInfo.userName)
                        socket.join(roomStreamedInfo.roomId);
                        socket.room = roomStreamedInfo.roomId; //TODO look this up, feels redundant
                        //emit over to the room that a person has joined
                        socket.to(roomStreamedInfo.roomId).emit("recieveRoomCount", roomToJoin)  
                        console.log(`user with ID ${socket.id} joined room ${roomStreamedInfo.roomId}`);
                    };
                };
            } catch (error) {
                //eventually need to write a socket to handle this
                console.error(error)
            };
        };
    });

    socket.on("sendMessage", (messageData) => {
        console.log(messageData);
        //Now send to the frontend to anyone in the same room
        socket.to(messageData.room).emit("recieveMessage", messageData);
    });
    //Purpose: Cleans up disconnecting via the following
    // takes them out of the room, and if the room hits 0 people removes it from the roomCount obj
    socket.on("disconnect", async () => {
        //on disconnect check if they are a part of any rooms
        /*
        for (let roomId of Object.keys(allRooms)){
            if (allRooms[roomId].creatorUsername === socket.req.currentUser ){
                //kill the room and disconnect everyone
                const userSockets = await io.of("/chat").in()
                delete allRooms[roomId];

            }
        }*/
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