// DEPENDENCIES
const express       = require('express');
const app           = express();
//Annie note: currently for every route Im doing res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
const cors          = require('cors');


// CONFIGURATION / MIDDLEWARE
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


//ROUTES



//CATCHALL ROUTE
app.get('*', (req,res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.status(404).json({message: 'Page not found'});
});

//LISTEN
app.listen(process.env.PORT, () => {
    console.log(`Boggle Backend app listening at http://localhost:${process.env.PORT}`);
});