const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../models/User");


// auth

exports.auth = async (req, res, next) => {
  try {
    // Extract token from cookies, body, or Authorization header
    const token =
      req.cookies.token ||
      req.body.token ||
      (req.header("Authorization") || "").replace("Bearer ", "");

    // Check if token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing"
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "An error occurred while authenticating the user",
    });
  }
};


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

exports.isInstructor = async(req, res, next) =>{
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

exports.isAdmin = async (req, res, next) => {
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
