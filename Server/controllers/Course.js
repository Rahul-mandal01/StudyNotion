const Course = require("models/course");
const Tag = require("models/tag");
const User = require("models/user");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (req, res) => {
    try{

        // FETCH DATA 
        const { courseName,
                    courseDescription,
                        whatYouWillLearn,
                            price,
                                tag
                                    } = req.body;
        
        // GET THUMBNAIL
        const thumbnail = req.files.thumbnailImage;

        // VALIDATION

        if( !courseName || 
                !courseDescription ||
                    !whatYouWillLearn ||
                        !price ||
                            !tag ||
                                !thumbnail){
                                    res.status(400).json({
                                        success: false,
                                        message: "All fields are required",
                                            });
            }
        
            // CHECK FOR INSTRUCTOR

            const userId = req.user.id;
            const instructorDetails = await User.findById(userId);
            console.log( "Instructor Details: " , instructorDetails);

            // TODO: verify that userId and InstructionDetails._id are same or different ?

            

            if(!instructorDetails){
                return res.status(404).json({
                    success: false,
                    message: "You are not an instructor",
                });
            }


            // CHECK GIVEN TAG IS VALID OR NOT
            const tagDetails = await Tag.findById(tag);
            if(!tagDetails){
                return res.status(404).json({
                    success: false,
                    message: "Invalid tag",
                });
            }

            // UPLOAD IMAGE TO CLOUDINARY
            const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

            // CREATE AN ENTRY FOR NEW COURSE IN DATABASE

            const newCourse = await Course.create({
                courseName,
                courseDescription,
                instructor: instructorDetails._id,
                whatYouWillLearn,
                price,
                thumbnailImage,
                tags: tagDetails._id,
            })

            // ADD THE NEW COURSE TO THE USER SCHEMA OF INSTRUCTOR

            await User.findByIdAndUpdate(
                {_id: instructorDetails._id},
                {
                    $push :{
                        courses: newCourse._id,
                    }
                },
                {new: true},
            );


            // UPDATE THE TAG KA SCHEMA
            // TODO: HOMEWORK

            return res.status(200).json({
                success: true,
                message: "Course Created successfully",
                data: newCourse,
            });



    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `An error occurred while creating course: ${error.message}`,
        });
    }
}

// getAllCourses handler function

exports.showAllCourses = async (req, res ) => {
    try{
        const allCourses = await Course.find({}, {courseName: true,
                                                    price: true,
                                                    thumbnail: true,
                                                    instructor: true,
                                                    ratingAndReviews: true,
                                                    studentsEnrolled: true})
                                                    .populate("instructor")
                                                    .exec();
        
        return res.status(200).json({
            success: true,
            message: "All courses fetched successfully",
            data: allCourses,
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: `An error occurred while fetching all courses: ${error.message}`,
        });
    }
}