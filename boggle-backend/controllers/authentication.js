
//DEPENDENCIES AND GLOBAL MODULES
const authentication = require('express').Router();
const db             = require("../models");
const bcrypt         = require('bcrypt');
const jwt            = require('json-web-token');


const { User_Auth } = db;


//Purpose: on signin check if the user exists and create a JWT token if they do 
authentication.post('/', async (req, res) => {
    try {
        //do some backend validation and just send the same error as they would usually get if its just invalid
        const validationCriteria = [
            {input: req.body.email,
                regex: new RegExp("^[^@]+@[^@]+\.[^@]+$"),
                customError: 'Emails must be valid.'
            },
            {input: req.body.password,
                //regex: new RegExp('^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$'), THIS is throwing an error here and matching incorrectly despite working perfectly on front end, not sure why
                regex: new RegExp('^.{8,}$'),
                customError: 'Passwords must be at minimum eight characters' //and have one letter, one number, and one special character.'
            }
        ];
        validationCriteria.forEach((validation)=> {
            if (!validation.regex.test(validation.input)){
                throw validation.customError;
            }
        });
        //if it passes validation as something not wild check if they exist in your users
        let user = await User_Auth.findOne({
            where: { email: req.body.email }
        });
        //and if they gave the right password
        if (!user || !await bcrypt.compare(req.body.password, user.passwordDigest)) {
                throw 'incorrect password';
        } else {
            const result = await jwt.encode(process.env.JWT_SECRET, {id: user.userId});
            //now only give them the information from user they actually need
            const userObj = {firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username};
            res.status(200).json({ user:userObj, token: result.value});
        }
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: `Could not find a user with the provided username and password` });
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
