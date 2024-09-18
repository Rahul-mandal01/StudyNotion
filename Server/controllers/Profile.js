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

exports.deleteAccount = async (req, res) =>{
    try{
        // GET USER ID
        const id = req.user.id;

        // VALIDATION
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // DELETE PROFILE
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});



        // HOMEWORK-----------------> UNEROLL USER FROM ALL ENROLLED COURSES--------



        // DELETE USER
        await User.findByIdAndDelete({_id: id});

        
        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });


    }catch(error){
        console.log("Error deleting account: " + error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    }
}


// FETCH ALL DETAILS OF USER

exports.getAllUserDetails = async (req, res) => {
    try{
        // GET USER ID
        const id = req.user.id

        // GET USER DETAIL AND VALIDATE USER
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            userDetails: userDetails,
        })
        
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    }
}