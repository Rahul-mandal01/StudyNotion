const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try{
        // GET DATA
        const {dateOfBirth="", about="", contactNumber, gender } = req.body;

        // GET USER ID
        const id = req.user.id;

        // VALIDATION
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            }); 
        }


        // FIND PROFILE
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);


        // UPDATE PROFILE DATA
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;


        // SAVE CHANGES
        await profileDetails.save();
        
        // RESPONSE

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails: profileDetails,
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// ACCOUNT DELETE