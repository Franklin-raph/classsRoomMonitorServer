const jwt = require('jsonwebtoken')
const Student = require('../models/studentModel');


const requireAuth = (req, res, next) => {
    // Get token
    const token = req.cookies.myToken
    console.log(token);

    // check if jwt exist and is verified
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err,decodedtoken) =>{
            if(err){
                console.log(err);
            }else {
                console.log(decodedtoken)
                console.log("Token is present")
                next();
            }
        })
    } else {
        console.log("Token is not present")
        return res.send('Token is not present')
    }
}


// check current student
const checkStudent =  (req, res, next) => {
    const token = req.cookies.myToken;
    console.log(token)

    if(token){
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken)=> {
            if(err){
                console.log(err.message)
                res.locals.user = null;
            }else{
                let student = await Student.findById(decodedToken.id)
                res.locals.student = student
                next();
            }
        })
        console.log("Token is for current user")
    } else{
        res.locals.student = null;
        next();
        console.log("Token is not for current user")
    }
}


module.exports = {
    requireAuth, checkStudent
}