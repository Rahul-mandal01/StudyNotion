
const User = require("../model/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


// reset password token
exports.resetPasswordToken = async(req, res) =>{
    try{
        // GET EMAIL FROM REQ BODY
        const {email} = req.body;

        // EMAIL VALIDATION, CHECK USER WITH THIS EMAIL
        const user = await User.findOne({email: email});
        if(!user){
            return res.json({
                success: false,
                message: "Your email is not registered with us"
            })
        }


        //GENERATE TOKEN 
        const token = crypto.randomUUID();
        console.log(token);

        // UPDATE USER BY ADDING TOKEN AND EXPIRATION TIME
        const updatedDetails = await User.findOneAndUpdate(
                                        {email: email},
                                        {
                                            token: token,
                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                        },
                                        {new:true});
        


        // CREATE URL
            const url = `http://localhost:3000/update-password/${token}`

        // SEND EMAIL WITH RESET LINK
        await mailSender(email,
                             "Password Reset Password Link",
                                `Password Reset Password Link: ${url}`);




        // RETURN RESPONSE
        return res.json({
            success: true,
            message: "Reset password link sent successfully, please check email and change password",
        });


    }catch(error){
        res.status(401).json({
            status: false,
            message:"Something went wrong, couldn't reset password"
        })
    }
}


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