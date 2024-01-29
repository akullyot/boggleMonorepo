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

io.on("connection", (socket) => {
    //Lets keep track of every room and the number of clients within each room
    const numberOfClientsPerRoom = {};
    console.log(socket.id, 'socketID');
    //Purpose: when you join or create a room, this will create the room and add it to the 
    //         number of clients per room, and update anyone else currently in the room that another joined
    socket.on("joinRoom", (room) => {
        socket.join(room);
        //lets five this a specific room name for disconnecting
        socket.room = room;
        console.log(`user with ID ${socket.id} joined room ${room}`);
        //add to our room Counter
        if (numberOfClientsPerRoom[room] === undefined){
            numberOfClientsPerRoom[room];
        }else{
            numberOfClientsPerRoom[room]++;
        }
        //send over to the current users in the room how mnay are present
        socket.to(room).emit("roomCount", numberOfClientsPerRoom[room])
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