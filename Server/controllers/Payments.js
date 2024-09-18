const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");


// CAPTURE THE PAYMENT AND INITIATE THE RAZORPAY ORDER
exports.capturePayment = async (req, res)=> {
    try{

        // FETCH ID'S
        const {course_id} = req.body;
        const user_id = req.user.id;

        // VALID COURSE ID
        if(!course_id){
            return res.json({
                success: false,
                message: "Please provide valid course ID",
            })
        }

        // VALID COURSE DETAIL
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success: false,
                    message: "Could not find the course",
                });
            }

            // CHECK IF USER ALREADY PAY FOR THE SAME COURSE
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.json({
                    success: false,
                    message: "User has already enrolled for this course",
                });
            }

        }catch(error){
            console.error(error);
            return res.status().json({
                success: false,
                message: `An error occurred while fetching course details ${error.message}`,
            });
        }
        
        // CREATE ORDER
        // RETURN RESPONSE

    }catch(error){

    }
}