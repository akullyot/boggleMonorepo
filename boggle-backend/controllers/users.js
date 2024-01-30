//DEPENDENCIES AND GLOBAL MODULES
const users             = require('express').Router()
const db                = require('../models');
const bcrypt            = require('bcrypt');
const jwt               = require('json-web-token');
//GET RELEVANT TABLES
const { User_Auth } = db;


//Purpose: POST on signup create a new user
users.post('/', async (req, res) => {
    //Backend Validation => first check the inputs arent something wild, then do a find to the database to see if anything matches and then deny if they arent unique
        //Note for muself: https://regexr.com was used to generate these
        //username rules: must be unique, 6-30 chars long, a-z 0-9, can have @, ., -, _
        //as well, it must end and start with a letter or number
        //Name Rules: A-Z a-z 1-20 characters
        //Password Rules: minimum eight characters, at least one letter, one number, one special char
    try {
        const validitionCriteria = [
            {input: req.body.username,
                regex: new RegExp('^(?=.{6,30}$)(?:[a-zA-Z0-9\d]+(?:(?:\.|-|_|@)[a-zA-Z0-9\d])*)+$'),
                customError: 'usernames must be 6-30 characters long, only include letters, numbers, dashes, underscores, and at symbols, and start and end with a letter or number'
            },
            {input: req.body.email,
                regex: new RegExp("^[^@]+@[^@]+\.[^@]+$"),
                customError: 'Emails must be valid.'
            },
            {input: req.body.firstName,
                regex: new RegExp('^[a-zA-Z]{1,20}$'),
                customError: 'First names must be 1-20 characters and only contain letters.'
            },
            {input: req.body.lastName,
                regex: new RegExp('^[a-zA-Z]{1,20}$'),
                customError: 'Last names must be 1-20 characters and only contain letters.'
            },
            {input: req.body.password,
                //regex: new RegExp('^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$'), THIS is throwing an error here and matching incorrectly despite working perfectly on front end, not sure why
                regex: new RegExp('^.{8,}$'),
                customError: 'Passwords must be at minimum eight characters' //and have one letter, one number, and one special character.'
            },
        ]
        validitionCriteria.forEach((validation)=> {
            if (!validation.regex.test(validation.input)){
                throw validation.customError;
            }
        });
        //no repeat passwords or usernames
        duplicateChecks = [{input: req.body.username, column: 'username', error: 'username is already taken.'}, {input: req.body.email, column: 'email', error: 'An account already exists with this email.'}];
        for (const value of duplicateChecks){
            const foundResult = await User_Auth.findOne({where: { [value.column] : value.input}});
            if (foundResult !== null){
                throw value.error  
            }
        };
        //Now create new user
        //Create your validated user and hashed password
        let { password, ...rest } = req.body;
        const user = await User_Auth.create({ 
            ...rest,
            dateRegistered: new Date(),
            lastLogin: new Date(), 
            passwordDigest: await bcrypt.hash(password, 10)
        });
        //If this succeeds lets now make a token to send over for us to stay logged in
        const result = await jwt.encode(process.env.JWT_SECRET, {id: user.userId});
        const userObj = {firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username}
        res.status(200).json({ user:userObj, token: result.value })
    } catch (error) {
        console.error(error);
        //TODO NO IDEA ON THE CORRECT STATUS CODE
        return res.status(406).json({message: error});
    };
});  
//Purpose: GET user information for their individual profile
//todo here: check if its their profile or someone elses, if it is someone elses also check if they are your friend
// Purpose: POST on editing user information




//Purpose: gets a list of all users, will likely be used later for searching for friends
users.get('/', async (req, res) => {
    const users = await User_Auth.findAll()
    res.json(users)
});


module.exports = users