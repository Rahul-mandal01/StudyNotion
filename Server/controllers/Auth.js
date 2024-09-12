const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();

// SEND OTP
exports.sendOTP = async (req, res) => {
    try{
         // fetch email from request's body
        const {email} = req.body;

        // check if user already exists
        const checkUserPresent = await User.findOne({email});
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message:"User already exists",
            })
        }

        // genetate OTP

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("OTP Generated", otp);

        // check uniqueness in otp
        const result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({otp: otp});
        }


        const otpPayload = {email, otp};

        // save otp to database
        const  otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successfully
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        })

    }catch(error){
        console.log("Error fetching user: " + error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    
    }
}


// sign up

exports.signup = async (req, res) => {

    try{
            // DATA FETCH FROM REQ BODY
            const {
                email,
                password,
                confirmPassword,
                firstName,
                lastName,
                accountType,
                contactNumber,
                otp,
            } = req.body;


            // VALIDATE REQUEST

            if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                })
            }

            // 2 PASSWORD MATCH

            if(password !== confirmPassword){
                return res.status(400).json({
                    success: false,
                    message: "Passwords do not match",
                })
            }

            // CHECK USER ALREADY EXISTS OR NOT

            const existingUser = await User.findOne({email});
            if(existingUser){
                return res.status(400).json({
                    success: false,
                    message: "User already registered",
                })
            }

            // FIND MOST RECENT OTP STORED FOR THE USER
            const recentOtp = await OTP.findOne({email}).sort({createdAt: -1}).limit(1);
            console.log(recentOtp);

            // VALIDATE OTP
            if(recentOtp.length == 0){
                // OTP not found
                return res.status(400).json({
                    success: false,
                    message: "OTP Not Found",
                })
            }else if( otp !== recentOtp.otp){
                // Invalid OTP
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP",
                })
            }

            // HASH PASSWORD
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Hashed Password: ", hashedPassword);

            // ENTRY CRAETE IN DATABASE

            const profileDetails = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: null,
                contactNumber: null,
            })

            const user = await User.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                accountType,
                contactNumber,
                additionalDetails: profileDetails._id,
                image: `https://api.dicebear.com/9.x/initials/svg?seed= ${firstName} ${lastName}`,
            })

            // RETURN RES
            
            return res.status(200).json({
                success: true,
                message: "User registered successfully",
                user,
            })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    }
}

// login

exports.login = async(req, res) => {
    try{

        // GET DATA FROM REQ BODY
        const {email, password} = req.body;

        // DATA VALIDATION

        if(!email ||!password){
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        // USER EXIST OR NOT

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found, please sign up first",
            });
        }


        // AFTER PASSWORD MATCH, GENERATE JWT

        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                role : user.role
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
                });
            user.token = token;
            user.password = undefined;

            // CREATE COOKIE AND SEND RESPONSE 

            const options = {
                expires: new Date(Date.now() + 3*24 *60 *60 * 1000),
                httpOnly: true, 
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                message: "Login successful",
                user,
                token,
            });

        }else{
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }


    }catch(error){
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "An error occurred while logging in, please try again",
        })
    }
}

// change password
// --------------------------HOMEWORK------------
exports.changePassword = async(req, res) =>{
    try{
        // GET DATA FROM REQ BODY
        // GET OLD PASSWORD, NEW PASSWORD, CONFIRM PASSWORD
        // VALIDATION
        // UPDATE PASSWORD IN DATABASE
        // SEND EMAIL --PASSWORD UPDATE
        // RETURN RESPONSE

    }catch(error){

    }
}