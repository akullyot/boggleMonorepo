const jwt = require('json-web-token');
const passport = require('passport-jwt');
const db = require("../models")
const { User_Auth } = db;

async function socketdefineCurrentUser(req,res,next){
    const isHandshake = req._query.sid === undefined;
    if (!isHandshake) {
        return next();
    }
    const header = req.headers["authorization"];
    if (!header) {
        return next(new Error("no token"));
    }
    const [ method, token ] = header.split(' ');
    if (method !== 'Bearer') {
        return next(new Error("invalid token"));
    }
    jwt.decode(process.env.JWT_SECRET, token,  async (err, decoded) => {
        if (err) {
            return next(new Error("invalid token"));
        }
        //Go look in your database to get their information based on the userId from token
        let userId = decoded.id;
        let user = await User_Auth.findOne({ where: {userId: userId}});
        if (user){
        //TODO not sure what i actually want, but for now Ill just give the username
        const userObj = {username: user.username, id: user.userId}
        req.currentUser = userObj;
        //TODO DO SOMETHING ABOUT GUESTS
        }else{
        //throw some sort of error
        req.currentUser = null;}
        next();
        });
}


module.exports = socketdefineCurrentUser;