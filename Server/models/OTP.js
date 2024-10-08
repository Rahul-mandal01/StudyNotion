const mongoose= require("mongoose");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },

    otp:{
        type:String,
        required: true,
    },

    createdAt:{
        type: Date,
        default: Date.now(),
        expires: 5*60,
    }
})

// function to send email notification

async function sendVerificationEmail(email, otp){
    // code to send email using nodemailer or any other email service
    try{
        const mailResponse = await mailSender(email,"Verification Email from StudyNotion", otp);
        console.log("Email sent Successfully: ", mailResponse);
    }catch(error){
        console.log("Error sending verification email: " + error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);