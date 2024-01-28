
//DEPENDENCIES AND GLOBAL MODULES
const authentication = require('express').Router();
const db             = require("../models");
const bcrypt         = require('bcrypt');
const jwt            = require('json-web-token');


const { User_Auth } = db;


//Purpose: on signin check if the user exists and create a JWT token if they do 
authentication.post('/', async (req, res) => {
    let user = await User_Auth.findOne({
        where: { email: req.body.email }
    });
    if (!user || !await bcrypt.compare(req.body.password, user.passwordDigest)) {
        res.status(404).json({ 
            message: `Could not find a user with the provided username and password` 
        })
    } else {
        const result = await jwt.encode(process.env.JWT_SECRET, {id: user.userId})
        res.json({ user:user, token: result.value })
    }
});

//Used by the context to get profiles
authentication.get('/profile', async (req, res) => {
    if (req.currentUser !== null){
        res.json(req.currentUser)
    }else{
        res.json(null)
    }
});




module.exports = authentication;
