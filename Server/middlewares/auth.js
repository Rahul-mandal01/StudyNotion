const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../models/User");


// auth

exports.auth = async(req, res, next) => {
    try{
        // extract token
        const token = req.cookies.token 
                            || req.body.token 
                                || req.header("Authorisation").replace("Bearer ","");

        // if token is missing, then return response
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            });

            // verify the token
            try{
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                console.log(decode);
                req.user = decode; 
            }catch(error){
                // verification - issue
                return res.status(401).json({
                    success: false,
                    message: "token is invalid",
                })
            }
            next();
        }
    }catch(error){
        return res.status(401).json({
            success: false,
            message: "An error occurred while authenticating the user",
        })
    }

}

// isStudent

exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message:"This is protected route for Student only"
            });
        }
        next();

    }catch(error){
        res.status(500).json({
            success:false,
            message:"User role can not be verified, Please try again"
        })
    }
}

// isInstructor

exports.isInsturctor = async(req, res, next) =>{
    try{
        if( req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Instructor only",
            })
        }
        next();
    }catch(error){
        res.status(500).json({
            success:false,
            message:"User role can not be verified, please try again"
        })
    }
}

// isAdmin

exports.IsAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: "This is protected route for admin only"
            })
        }
    }catch(error){
        res.status(500).json({
            success: false,
            message:"User role can not be verified, please try again"
        })
    }
}
