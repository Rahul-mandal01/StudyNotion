
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


// reset password token
exports.resetPasswordToken = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
			});
		}
		const token = crypto.randomBytes(20).toString("hex");

		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000,
			},
			{ new: true }
		);
		console.log("DETAILS", updatedDetails);

		const url = `http://localhost:3000/update-password/${token}`;

		await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

		res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
};


// reset password

exports.resetPassword = async(req, res) => {
    try{
        // DATA FETCH
        const {token, password, confirmPassword} = req.body;

        // VALIDATION
        if(password !== confirmPassword){
            return res.json({
                success: false,
                message: "Passwords do not match"
            });
        }


        // GET USER DETAILS FROM DATABASE USING TOKEN
        const userDetails = await User.findOne({token:token});

        // IF NO ENTRY --INVALID TOKEN

        if(!userDetails){
            return res.json({
                success: false,
                message: "Invalid token, please try again"
            })
        }


        // TOKEN TIMECHECK

        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message: "Token has expired, please try again"
            })
        }


        // HASHED PASSWORD

        const hashedPassword = await bcrypt.hash(password, 10);

        // UPDATE USER PASSWORD

        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true},
        )


        // RETURN RESPONSE

        return res.json({
            success: true,
            message: "Password reset successful, please login with new password"
        })



    }catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, couldn't reset password"
        })
    }
}