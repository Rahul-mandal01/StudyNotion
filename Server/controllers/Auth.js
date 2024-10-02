const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();


// SEND OTP FOR EMAIL VERIFICATION

exports.sendOTP = async (req, res) => {
    try{
         // fetch email from request's body
        const {email} = req.body;

        // check if user already exists
        const checkUserPresent = await User.findOne({email});

        // IF USER FOUND WITH PROVIDED EMAIL
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message:"User is already registered",
            })
        }

        // GENERATE OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("OTP Generated: ", otp);


        // CHECK UNIQUENESS IN OTP
        const result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({otp: otp});
        }


        const otpPayload = {email, otp};

        // save otp to database
        const  otpBody = await OTP.create(otpPayload);
        console.log( "OTP Body" ,otpBody);

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


// SIGNUP CONTROLLER FOR AUTHENTICATING USERS

exports.signup = async (req, res) => {

    try{
            // Destructure fields from the request body
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

            if(!firstName || 
                !lastName || 
                !email || 
                !password || 
                !confirmPassword || 
                !otp
            ){
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
                return res.status(409).json({
                    success: false,
                    message: "User already registered, Please sign in to continue",
                })
            }

            // FIND MOST RECENT OTP STORED FOR THE USER
            const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);  //.sort({createdAt: -1}): This sorts the results by the createdAt field in descending order (newest first). The -1 indicates descending order
            console.log(recentOtp);

            // VALIDATE OTP
            if(recentOtp.length === 0){
                // OTP not Pound
                return res.status(404).json({
                    success: false,
                    message: "Invalid OTP",
                })
            }else if( otp !== recentOtp[0].otp){
                // Invalid OTP
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP",
                })
            }

            // HASH PASSWORD
            const hashedPassword = await bcrypt.hash(password, 10);         // Hash the password with 10 salt rounds
            console.log("Hashed Password: ", hashedPassword);

            // Create the user
            let approved = "";
            approved === "Instructor" ? (approved = false) : (approved = true);

            // ENTRY CREATE IN DATABASE

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
                accountType: accountType,
                contactNumber,
                approved: approved,
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

// LOGIN CONTROLLER FOR REGISTERING USER

exports.login = async(req, res) => {
    try{

        // GET DATA FROM REQ BODY
        const {email, password} = req.body;

        // DATA VALIDATION

        if(!email ||!password){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        // USER EXIST OR NOT

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found, please sign up first",
            });
        }


        // AFTER PASSWORD MATCH, GENERATE JWT

        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h"
                });

            // SAVE TOKEN TO USER DOCUMENTS IN DATABASE
            user.token = token;
            user.password = undefined;      // This ensures that the password is not exposed when the user object is sent back to the client.

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

// CONTROLLER FOR CHANGING PASSWORD

exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({ 
                success: false, 
                message: "The password is incorrect" 
            });
		}

		// Match 'new password' and 'confirm new password'
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res.status(200).json({ 
            success: true, 
            message: "Password updated successfully" 
        });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};