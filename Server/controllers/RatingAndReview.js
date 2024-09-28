const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// createRating Handler Function
exports.createRating = async(req, res) => {
    try{
        // GET USER ID
        const userId = req.user.id;

        // FETCH DATA FROM REQ BODY
        const { courseId, rating, review } = req.body;

        // CHECK IF USER IS ENROLLED OR NOT
        const courseDetails = await Course.findOne({
                                        _id: courseId,
                                        studentsEnrolled: {$elemMatch: {$eq: userId}},
                                    });
        
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: "User is not enrolled for this course",
            });
        }

        // CHECK IF USER ALREADY REVIEWED THE COURSE
        const alreadyReviewed = await RatingAndReview.findOne({
                                                        user:userId,
                                                        course: courseId
                                                    });
        
        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: "User has already reviewed this course",
            });
        }


        // CREATE RATING AND REVIEW
        const ratingReview = await RatingAndReview.create({
                                                rating, review,
                                                course: courseId,
                                                user: userId,
                                            });

        // UPDATE COURSE WITH RATING AND REVIEW
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                        {
                                            $push: {
                                                ratingsAndReviews: ratingReview._id,
                                            },
                                        },
                                        { new: true });
        
        console.log(updatedCourseDetails);

        // RETURN SUCCESS MESSAGE
        return res.status(200).json({
            success: true,
            message: "Rating and Review created successfully",
            data: ratingReview,
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating rating and review",
        }); 
    }
}

// getAveragedRating handler function



// getAllRating Handler function