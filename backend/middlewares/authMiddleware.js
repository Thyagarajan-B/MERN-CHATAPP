const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to know the user has log in using rigt token
const protect = async (req, res, next)=>{
    
    let token;
    // console.log(req.headers);
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decoded);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401).json({message: "Not Authorized, token failed"})
        }
    }
    if(!token){
        res.status(401).json({message: "Not Authorized, token not found"})
    }
}

// Middleware to check wether admin or not
const isAdmin = async(req, res, next)=>{
    try {
        if(req.user && req.user.isAdmin){
            next()
        }else{
            res.status(403).json({message : "Not Authorized Admin Only"})
        }
    } catch (error) {
        res.status(401).json({message : "Not Authorized Admin Only"})
    }
}
module.exports = {protect, isAdmin};
