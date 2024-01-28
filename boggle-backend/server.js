// DEPENDENCIES and GLOBAL MODULES
require('dotenv').config();
const express           = require('express');
const bodyParser        = require('body-parser');
const cors              = require('cors');
const app               = express();
const defineCurrentUser = require('./middleware/defineCurrentUser.js');
const { Sequelize }     = require('sequelize');
const db                = require('./models');


// CONFIGURATION / MIDDLEWARE
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(defineCurrentUser);


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
app.listen(process.env.PORT, () => {
    console.log(`Boggle Backend app listening at http://localhost:${process.env.PORT}`);
});