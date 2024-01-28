const db = require("../models")
const jwt = require('json-web-token')

const { User_Auth } = db;
async function defineCurrentUser(req, res, next){
    try {
        const [ method, token ] = req.headers.authorization.split(' ')
        //note: the frontend will send over empty 'null' tokens sometimes due to react strictmode probably/misused useEffect, so check that its not null to handle that 
        if(method == 'Bearer' && token !== 'null'){
            const result = await jwt.decode(process.env.JWT_SECRET, token)
            const { id } = result.value
            let user = await User_Auth.findOne({ 
                where: {
                    userId: id
                }
            })
            const userObj = {firstName: user.firstName, lastName: user.lastName, email: user.email, userName: user.userName}
            req.currentUser = userObj;
        }else{
            req.currentUser = null;
        }
        next()
    } catch(err){
        console.log(err)
        req.currentUser = null
        next() 
    }
};

module.exports = defineCurrentUser;
