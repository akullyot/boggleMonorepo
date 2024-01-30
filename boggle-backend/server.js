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
const {Server}          = require("socket.io")
const server            = http.createServer(app);




// CONFIGURATION / MIDDLEWARE
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); //note: probably wont need
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(defineCurrentUser);
//Create a new instance of the server class that is running on the socket and connect it to our express
//TODO move this out of server.js
const io = new Server(server, {cors : {
    origin: process.env.REACT_SERVER, //which url is calling and making calls to our socketio server, so our react server
    methods: ["GET", "POST"] 
}});

//Global socket variables
//Purpose: stores room information: roomid is the main key, the rest are the nest objects vars
    //Users:     all usernames of users currently present in a room
    //maxSize:   the creator can specify the size of the room
    //isPrivate: if the user sets it to private only those that are friends with them can join
    //               //TODO in the future: seperate this into 2, show on public search screen or anyone with room id can join
    //               //These games will also not show on the public find rooms section
    //creatorUsername: the username of creator, used for private db querying
    //isInProgress: stops others from entering
const allRooms = {};

io.on("connection", (socket) => {
    console.log(socket.id, 'socketID');
    //SOCKET EMITTER AND RECIEVERS

    socket.on("joinRoom", async (roomStreamedInfo) => {
        //check if they are the creator
        if (roomStreamedInfo.isCreator){
            try {
                //check that they didnt do a duplicate name 
                if (allRooms[roomStreamedInfo.roomId]){
                    throw 'Room id already exists'
                }else{
                    //add to your room object
                    allRooms[roomStreamedInfo.roomId] = {
                        users           : [roomStreamedInfo.userName],
                        maxSize         : roomStreamedInfo.maxSize,
                        isPrivate       : roomStreamedInfo.isPrivate,
                        creatorUsername : roomStreamedInfo.userName,
                        isInProgress    : false
                    }
                    //establish this id as having joined the room
                    await socket.join(roomStreamedInfo.roomId);
                    socket.room = roomStreamedInfo.roomId

                    //emit over to the room that a person has joined
                    console.log(`user with ID ${socket.id} made room ${roomStreamedInfo.roomId}`);
                    socket.to(roomStreamedInfo.roomId).emit("recieveRoomCount", "test")  
                    
                }
            } catch (error) {
                //throwing an error will emit a socket error message eventually in the catch
                console.error('error in creating a room' + error);
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
    socket.on("disconnect", () => {
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