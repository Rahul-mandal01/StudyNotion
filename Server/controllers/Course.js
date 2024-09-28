const Course = require("models/course");
const Category = require("models/category");
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
                                tag,
                                    category,
                                        status,
                                            instructions
                                    } = req.body;
        
        // GET THUMBNAIL
        const thumbnail = req.files.thumbnailImage;

        // VALIDATION

        if( !courseName || 
                !courseDescription ||
                    !whatYouWillLearn ||
                        !price ||
                            !tag ||
                                !thumbnail ||
                                    !category){
                                    res.status(400).json({
                                        success: false,
                                        message: "All fields are required",
                                            });
            }

            if (!status || status === undefined) {
                status = "Draft";
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


            // CHECK GIVEN CATEGORY IS VALID OR NOT
            const categoryDetails = await Category.findById(category);
            if (!categoryDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Category Details Not Found",
                });
            }

            // UPLOAD IMAGE TO CLOUDINARY
            const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

            // CREATE AN ENTRY FOR NEW COURSE IN DATABASE

            const newCourse = await Course.create({
                courseName,
                courseDescription,
                instructor: instructorDetails._id,
                whatYouWillLearn: whatYouWillLearn,
                price,
                tag: tag,
                category: categoryDetails._id,
                thumbnail: thumbnailImage.secure_url,
                status: status,
                instructions: instructions,
            });
    

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

		// Add the new course to the Categories
		await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);

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
                                                    studentsEnrolled: true
                                                }
                                            )
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


// getCourseDetails handler function

exports.getCourseDetails = async (req, res ) => {
    try{
        // GET ID
        const { courseId } = req.body;

        // FIND COURSE DETAIL
        const courseDetails = await Course.find(
                                        {_id: courseId})
                                        .populate(
                                            {
                                                path : "instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                }
                                            }
                                        )

                                        .populate("category")
                                        .populate("ratingAndReviews")
                                        .populate({
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection"
                                            }
                                        })
                                        .exec();
                    
        // VALIDATION
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find course with ${courseId}`,
            });
        }

        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails,
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `An error occurred while fetching course details: ${error.message}`,
        });
    }
}